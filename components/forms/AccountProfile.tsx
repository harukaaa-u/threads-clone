"use client"
import '../../app/globals.css'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userValidation } from '@/lib/validations/user';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from '../ui/textarea';
import { Input } from "@/components/ui/input"
import Image from 'next/image';
import * as z from 'zod';
import { ChangeEvent } from 'react';
import { isBase64Image } from '@/lib/utils';
import { useUploadThing }  from '@/lib/validations/useUploadThing';
import { updateUser } from '@/lib/actions/user.actions';
import { usePathname, useRouter } from 'next/navigation';

interface Props {
    user: {
        id: string,
        objectID: string,
        username: string,
        name: string,
        bio: string,
        image: string,
    };
    btnTitle: string;
}

const AccountProfile= ({user, btnTitle} : Props) => {
    const[files, setFiles] = useState<File[]>([]);
    const pathname = usePathname();
    const router = useRouter();
    //define uploadthing as hook
    const { startUpload } = useUploadThing("media");
    const form = useForm({resolver: zodResolver(userValidation), 
    defaultValues: {
        profile_photo: user?.image,
        name:user?.name,
        username:user?.username,
        bio:user?.bio
    }
    });

    const handleImage = (e : ChangeEvent<HTMLInputElement>, fieldChange: (value : string) => void) => {
        e.preventDefault();
        //upload & change image using filereader
        const fileReader = new FileReader();
        if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setFiles(Array.from(e.target.files));
          if (!file.type.includes('image')) return;
          fileReader.onload = async (event) => {
            const imageDataUrl = event.target?.result?.toString() || '';
            fieldChange(imageDataUrl); //react hook form field change
          }
          fileReader.readAsDataURL(file);
        }
    }

    const onSubmit = async (values: z.infer<typeof userValidation>) => {
        // update user in mongodb
        const blob = values.profile_photo; //value from image is called blob
        const hasImageChanged = isBase64Image(blob);
        //only happens if reupload image
        if (hasImageChanged) {
          const imageRes = await startUpload(files);
          if (imageRes && imageRes[0].fileUrl) {
            values.profile_photo = imageRes[0].fileUrl;
          }
        }
       // update user profile
        await updateUser(
          user.id,
          values.username,
          values.name,
          values.profile_photo,
          values.bio,
          pathname
        );
        
        if (pathname === '/profile/edit') {
          router.back();
        } else {
          router.push('/');
        }
      }
    

    return (
        <Form {...form}>
        <form
        onSubmit={form.handleSubmit(onSubmit)} 
        className="flex flex-col justify-start gap-10">
          <FormField
            control={form.control}
            name="profile_photo"
            render={({ field }) => (
              <FormItem className='flex items-center gap-4'>
                <FormLabel className='account-form_image-label'>
                    {field.value ? (
                        <Image 
                        className="rounded-full object-contain"
                        src={field.value}
                        alt="profile photo"
                        width={124}
                        height={124}
                        />
                    ): (
                        <Image 
                        src='/assets/profile.svg'
                        alt="profile photo"
                        width={124}
                        height={124}
                        className='object-contain'
                        />
                    )}
                </FormLabel>
                <FormControl className="flex-1 text-base-semibold text-gray-200">
                  <Input
                    type="file"
                    accept="image/*"
                    placeholder='Upload a photo'
                    className='account-form_input'
                    onChange={(e) => handleImage(e, field.onChange)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className='flex flex-col w-full gap-3'>
                <FormLabel className='text-base-semibold text-light-2'>
                   Name
                </FormLabel>
                <FormControl className="flex-1 text-base-semibold text-gray-200">
                  <Input
                    type="text"
                    className='account-form_input no_focus'
                    {...field} //spread the field - no need to write onChange after spreading
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className='flex flex-col w-full gap-3'>
                <FormLabel className='text-base-semibold text-light-2'>
                   Username
                </FormLabel>
                <FormControl className="flex-1 text-base-semibold text-gray-200">
                  <Input
                    type="text"
                    className='account-form_input no_focus'
                    {...field} //spread the field - no need to write onChange after spreading
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className='flex flex-col w-full gap-3'>
                <FormLabel className='text-base-semibold text-light-2'>
                   Bio
                </FormLabel>
                <FormControl className="flex-1 text-base-semibold text-gray-200">
                  <Textarea
                    rows={10}
                    className='account-form_input no_focus'
                    {...field} //spread the field - no need to write onChange after spreading
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="bg-primary-500">Submit</Button>
        </form>
      </Form>
    )
}
export default AccountProfile;
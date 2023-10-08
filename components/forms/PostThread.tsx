"use client"

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
  FormMessage,
  FormLabel,
} from "@/components/ui/form"
import { Textarea } from '../ui/textarea';
import { Input } from "@/components/ui/input"
import * as z from 'zod';
import { useUploadThing }  from '@/lib/validations/useUploadThing';
import { usePathname, useRouter } from 'next/navigation';
import { ThreadValidation, CommentValidation } from '@/lib/validations/thread';
import { createThread } from '@/lib/actions/thread.actions';
import { getRandomValues } from 'crypto';

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


function PostThread({userId}: {userId: string}) {
    const pathname = usePathname();
    const router = useRouter();

    const form = useForm({resolver: zodResolver(ThreadValidation), 
    defaultValues: {
        thread: '',
        accountId: userId,
    }
    });

    const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
        await createThread({text: values.thread,
        author: userId,
        communityId: null, 
        path: pathname
    });
        
        router.push('/');
    }

    
    return (
        <Form {...form}>
        <form
        onSubmit={form.handleSubmit(onSubmit)} 
        className="mt-10 flex flex-col justify-start gap-10">
          <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className='flex flex-col w-full gap-3'>
                <FormLabel className='text-base-semibold text-light-2'>
                   Content
                </FormLabel>
                <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                  <Textarea
                    rows={15}
                    className='account-form_input no_focus'
                    {...field} //spread the field - no need to write onChange after spreading
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="bg-primary-500">Post Thread</Button>
        </form>
      </Form>
    )
}
export default PostThread;
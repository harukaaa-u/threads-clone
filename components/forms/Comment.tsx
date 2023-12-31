"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userValidation } from '@/lib/validations/user';
import { Button } from "@/components/ui/button"
import Image from 'next/image';
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
import { CommentValidation } from '@/lib/validations/thread';
import { addCommentToThread, createThread } from '@/lib/actions/thread.actions';

interface Props {
    threadId: string,
    currentUserImg: string,
    currentUserId: string
}

const Comment = ({threadId, currentUserImg, currentUserId} : Props) => {
    const pathname = usePathname();

    const form = useForm({resolver: zodResolver(CommentValidation), 
    defaultValues: {
        thread: '',
    }
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToThread(threadId, values.thread, JSON.parse(currentUserId), pathname);
        form.reset();
    };
    
    return (
        <Form {...form}>
        <form
        onSubmit={form.handleSubmit(onSubmit)} 
        className="comment-form">
          <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className='flex items-center w-full gap-3'>
                <FormLabel className='text-base-semibold text-light-2'>
                   <Image src={currentUserImg} alt="Profile img"
                   width={48} height={48}
                   className="rounded-full object-cover"/>
                   
                </FormLabel>
                <FormControl className="border-none bg-transparent">
                  <Input
                    type="text"
                    placeholder="Comment..."
                    className='account-form_input no_focus'
                    {...field} //spread the field - no need to write onChange after spreading
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="comment-form_btn">Reply</Button>
        </form>
      </Form>
    )
}

export default Comment;
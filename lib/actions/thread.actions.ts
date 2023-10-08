"use server"

import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model"
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import { connect } from "http2";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

export async function createThread({
    text, author, communityId, path
}: Params) {

    try {
        connectToDB();

        const createdThread = await Thread.create({ //created based on schema: use {}
            text,
            author,
            community: null,
        });
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id } //push to thread array
        })

        revalidatePath(path); //let change happen immediately

    } catch (error: any) {
        throw new error(`Error created in thread ${error.message}`)
    }
};

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    try {
        connectToDB();
        //calculate the number of pages to skip
        const skipAmount = (pageNumber - 1) * pageSize;
        //fetch posts that have no parent, so only top level threads
        const postsQuery = Thread.find({parentId: {$in:[null, undefined]}})
        .sort({createdAt: 'desc'})
        .skip(skipAmount)
        .limit(pageSize)
        .populate({path: 'author', model: User}) // reference doc in other collections
        .populate({path: 'children', populate: {
            path:'author',
            model: User,
            select: "_id name parentId Image"
        }})

        const totalPostsCount = await Thread.countDocuments({parentId: {$in: [null, undefined]}})
    
        const posts = await postsQuery.exec();
        const isNext = totalPostsCount > skipAmount + posts.length;
        return { posts, isNext };

    } catch (error: any) {
        throw new Error(`error fetching posts: ${error.message}`);
    }
}

export async function fetchThreadById(id: string) {
    connectToDB();
    try {
        const thread = await Thread.findById(id)
        .populate({
            path:'author',
            model: User,
            select: "_id id name image"
        })
        .populate({
            path:'children',
            populate: [{
                path:'author',
                model: User,
                select: "_id id name image parentId"
            }, {
                path: 'children',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: "_id id name image parentId" //comments of comment
                }
            }]
        }).exec();
        return thread;
    } catch (error: any) {
        throw new Error(`error fetching thread: ${error.message}`);
    }
}

export async function addCommentToThread(
    threadId: string, commentText: string,
    userId: string, path: string) {
        connectToDB();
        try {
            //find original thread by id
            const originalThread = await Thread.findById(threadId);
            if (!originalThread) {
                throw new Error("Thread Not Found")
            }
            const commentThread = new Thread({
                text: commentText,
                author: userId,
                parentId: threadId,
            })
            //save the new thread
            const savedCommentThread = await commentThread.save();

            //update the original thread to include the new comment
            originalThread.children.push(savedCommentThread._id);

            //save the original thread
            await originalThread.save();
            revalidatePath(path);
        } catch (error: any) {

        }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();
        //populate community later
        const threads = await User.findOne({id: userId})
        .populate({
            path:'threads',
            model: Thread,
            populate: {
                path: 'children',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
            }
        })
        return threads;
    } catch (error: any) {
        throw new Error(`failed to fetch user posts`);
    }
}
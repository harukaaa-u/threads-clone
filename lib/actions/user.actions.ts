"use server"
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { userValidation } from "../validations/user";
import Community from "../models/community.model";
import Thread from "../models/thread.model";


export async function updateUser(userId: string, username: string, name: string, image: string, bio: string, path: string): Promise<void> {
    connectToDB();

   try {
    await User.findOneAndUpdate(
        {id: userId}, 
        {
            username: username.toLowerCase(),
            name,
            image,
            bio,
            onboarded: true,
        },
        {
            upsert: true //update and insert
        }
        );
        if (path === '/profile/edit') {
            revalidatePath(path); //next js updates cache data 
        }
   } catch (error) {
    throw new Error(`Failed to create/update user.`);
   }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();
        console.log("fetching user")
        const user = await User.findOne({userId});
        console.log("user found");
        return user;
        // .populate({
        //     path:'communites',
        //     model: Communities,
        // });
    } catch (error: any) {
        throw new Error(`Failed to fetch user. ${error.message}`)
    }
}


export async function getActivity(userId: string) {
    try {
      connectToDB();
  
      // Find all threads created by the user
      const userThreads = await Thread.find({ author: userId });
  
      // Collect all the child thread ids (replies) from the 'children' field of each user thread
      const childThreadIds = userThreads.reduce((acc, userThread) => {
        return acc.concat(userThread.children);
      }, []);
  
      // Find and return the child threads (replies) excluding the ones created by the same user
      const replies = await Thread.find({
        _id: { $in: childThreadIds },
        author: { $ne: userId }, // Exclude threads authored by the same user
      }).populate({
        path: "author",
        model: User,
        select: "name image _id",
      });
  
      return replies;
    } catch (error) {
      console.error("Error fetching replies: ", error);
      throw error;
    }
  }

// export const fetchUserPosts = async (userId: string) => {
//     try {
//       connectToDB();
//       // Find all threads by user ID
//       const threads = await User.findOne({id: userId})
//       .populate({
//         path: 'threads',
//         model: 'Thread',
//         populate: [
//           {
//             path: "community",
//             model: 'Community',
//             select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
//           },
//           {
//             path: 'children',
//             model: 'Thread',
//             populate: {
//               path: 'author',
//               model: User,
//               select: 'id name image',
//             }
//           },
//         ]
//       });
  
//       return threads;
  
//     } catch (error: any) {
//       throw new Error(`Failed to fetch posts: ${error.messae}`)
//     }
// }
import DetailPostComponent from "@/components/DetailPostComponent.vue";
import PostList from "@/components/PostList.vue";
import PostCreate from "@/views/PostCreate.vue";
import PostUpdate from "@/views/PostUpdate.vue";

export const postRouter = [

    // {
    //     path:'/ttt/post/list/all',
    //     name:PostList,
    //     component:PostList

    // },
    {
        path:'/ttt/post/:id',
        name:DetailPostComponent,
        component:DetailPostComponent

    },
    {
        path:'/ttt/post/create',
        name:PostCreate,
        component:PostCreate

    },
    {
        path:'/ttt/post/list/:boardId',
        name:PostList,
        component:PostList

    },
    {
        path:'/ttt/post/update/:id',
        name:PostUpdate,
        component:PostUpdate

    },






]
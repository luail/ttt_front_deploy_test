import DetailPostComponent from "@/components/DetailPostComponent.vue";
import PostList from "@/components/PostList.vue";

export const postRouter = [

    {
        path:'/ttt/post/list',
        name:PostList,
        component:PostList

    },

    
    {
        path:'/ttt/post/:id',
        name:DetailPostComponent,
        component:DetailPostComponent

    },





]
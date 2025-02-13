import UserCreate from "@/views/UserCreate.vue";
import UserLogin from "@/views/UserLogin.vue";

export const userRouter= [
    {
        path:'/ttt/user/create',
        name:'UserCreate',
        component: UserCreate
    },
    {
        path:'/ttt/user/login',
        name:'UserLogin',
        component:UserLogin
    }
]
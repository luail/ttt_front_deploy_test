import GoogleRedirect from "@/views/GoogleRedirect.vue";
import UserCreate from "@/views/UserCreate.vue";
import UserList from "@/views/UserList.vue";
import UserLogin from "@/views/UserLogin.vue";
import UserMyInformation from "@/views/UserMyInformation.vue";

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
    },
    {
        path:'/ttt/user/list',
        name:'UserList',
        component:UserList
    },
    {
        path:'/ttt/user/myInformation',
        name:'UserMyInformation',
        component:UserMyInformation
    },
    {
        path: '/oauth/google/redirect',
        name: 'GoogleRedirect',
        component: GoogleRedirect
    },
]
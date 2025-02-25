import GoogleRedirect from "@/views/GoogleRedirect.vue";
import KakaoRedirect from "@/views/KakaoRedirect.vue";
import UserCreate from "@/views/UserCreate.vue";
import UserList from "@/views/UserList.vue";
import UserLogin from "@/views/UserLogin.vue";
import UserMyInformation from "@/views/MyPage/UserMyInformation.vue";
import MyPagePost from "@/views/MyPage/MyPagePost.vue";
import MyPageLikes from "@/views/MyPage/MyPageLikes.vue";
import OauthUserCreate from "@/views/OauthUserCreate.vue";
import Book from "@/views/Book.vue";

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
    {
        path: '/ttt/user/mypagepost',
        name: 'MyPagePost',
        component: MyPagePost
    },
    {
        path: '/ttt/user/mypagelikes',
        name: 'MyPageLikes',
        component: MyPageLikes
    },
    {
        path: '/oauth/kakao/redirect',
        name: 'KakaoRedirect',
        component: KakaoRedirect
    },
    {
        path: '/oauth/user/create',
        name: 'OauthUserCreate',
        component: OauthUserCreate
    },
    {
        path: '/ttt/book',
        name: 'Book',
        component: Book
    }
]
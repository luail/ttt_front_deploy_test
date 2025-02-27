import{createRouter,createWebHistory} from 'vue-router';
import { userRouter } from './userRouter';
import { chatRouter } from './chatRouter';
import { postRouter } from './postRouter';
import HomePage from '@/views/HomePage.vue';
import {ProjectRouter} from "@/router/ProjectRouter";

const routes = [
    ...userRouter,
    ...postRouter,
    ...chatRouter,
    {
        path:'/ttt',
        name:'HomePage',
        component:HomePage
    },
    ...ProjectRouter
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { 
            top: 0,
            behavior: 'smooth'
        }
    }
});

export default router;
import{createRouter,createWebHistory} from 'vue-router';
import { userRouter } from './userRouter';
import { chatRouter } from './chatRouter';
import { postRouter } from './postRouter';
import HomePage from '@/views/HomePage.vue';

const routes = [
    ...userRouter,
    ...postRouter,
    ...chatRouter,
        {
            path:'/ttt',
            name:'HomePage',
            component: HomePage
        },
]


const router = createRouter({
    history: createWebHistory(),
    routes 


});

export default router;
import{createRouter,createWebHistory} from 'vue-router';
import { userRouter } from './userRouter';
import { chatRouter } from './chatRouter';
import { postRouter } from './postRouter';
import UserMyInformation from '@/views/UserMyInformation.vue'

const routes = [
    ...userRouter,
    ...postRouter,
    ...chatRouter,
    {
        path: '/user/my-information',
        name: 'UserMyInformation',
        component: UserMyInformation,
        meta: { requiresAuth: true }
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes 


});

export default router;
import{createRouter,createWebHistory} from 'vue-router';
import { userRouter } from './userRouter';
import { postRouter } from './postRouter';

const routes = [
    ...userRouter,
    ...postRouter,
]


const router = createRouter({
    history: createWebHistory(),
    routes 


});

export default router;
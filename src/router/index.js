import{createRouter,createWebHistory} from 'vue-router';
import { userRouter } from './userRouter';
import { chatRouter } from './chatRouter';
import { postRouter } from './postRouter';

const routes = [
    ...userRouter,
    ...postRouter,
    ...chatRouter,
    
]


const router = createRouter({
    history: createWebHistory(),
    routes 


});

export default router;
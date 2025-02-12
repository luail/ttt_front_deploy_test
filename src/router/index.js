import{createRouter,createWebHistory} from 'vue-router';
import { tttRouter } from './tttRouters';

const routes = [


 ...tttRouter,


]


const router = createRouter({
    history: createWebHistory(),
    routes 


});

export default router;
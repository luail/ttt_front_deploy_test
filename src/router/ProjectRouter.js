import ProjectCreate from "@/views/ProjectCreate.vue";
import ProjectList from "@/views/ProjectList.vue";
import ProjectUpdate from "@/views/ProjectUpdate.vue";

export const ProjectRouter =[
    {
        path:'/ttt/project/create',
        name:'ProjectCreate',
        component:ProjectCreate
    },
    {
        path:'/ttt/project/find',
        name:'ProjectList',
        component:ProjectList
    },
    {
        path:'/ttt/project/update/:id',
        name:'ProjectUpdate',
        component:ProjectUpdate
    },

]
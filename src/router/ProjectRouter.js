import DetailProject from "@/views/DetailProject.vue";
import ProjectCreate from "@/views/ProjectCreate.vue";
import ProjectList from "@/views/ProjectList.vue";
import ProjectUpdate2 from "@/views/ProjectUpdate2.vue";
import ProjectUpdate from "@/views/ProjectUpdate2.vue";

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
    // ㅈㅇ
    {
        path:'/ttt/project/detail/:id',
        name:'DetailProject',
        component:DetailProject
    },
    {
        path:'/ttt/project/update2/:id',
        name:'ProjectUpdate2',
        component:ProjectUpdate2
    }

]
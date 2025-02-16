import ChatPage from "@/views/ChatPage.vue";
import GroupChattingList from "@/views/GroupChattingList.vue";

export const chatRouter= [
    {
        path:'/ttt/chat/list',
        name:'GroupChattingList',
        component: GroupChattingList
    },
    {
        path:'/ttt/chatpage/:roomId',
        name:'ChatPage',
        component: ChatPage
    },
    
]
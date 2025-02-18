import ChatPage from "@/views/ChatPage.vue";
import GroupChattingList from "@/views/GroupChattingList.vue";

export const chatRouter= [
    {
        path:'/ttt/chat/list',
        name:'GroupChattingList',
        component: GroupChattingList
    },
    {
        path:'/ttt/chatpage',
        name:'ChatPage',
        component: ChatPage
    },
    {
        path:'/ttt/chatpage/:roomId',
        name:'ChatRoomPage',
        component: ChatPage
    },
    {
        path:'/ttt/my/chat/page',
        redirect: { name: 'ChatPage' }
    }
]
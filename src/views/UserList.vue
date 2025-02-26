<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title class="text-center text-h5">
                        회원목록
                    </v-card-title>
                    <v-card-text>
                      <p v-if="isForbidden" class="text-center text-red text-h5">
                        관리자만 확인할 수 있는 페이지입니다.
                      </p>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>로그인ID</th><th>이름</th><th>email</th><th>휴대폰번호</th><th>닉네임</th><th>기수</th><th>블로그</th><th>랭킹포인트</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in userList" :key="user.loginId">
                                    <td>{{ user.loginId }}</td>
                                    <td>{{ user.name }}</td>
                                    <td>{{ user.email }}</td>
                                    <td>{{ user.phoneNumber }}</td>
                                    <td>{{ user.nickName }}</td>
                                    <td>{{ user.batch }}</td>
                                    <td>{{ user.blogLink }}</td>
                                    <td>{{ user.rankingPoint }}</td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import axios from 'axios';

export default {
    data(){
        return{
            userList:[],
            pageSize: 10,
            currentPage: 0,
            isLoading:false,
            isLastPage:false,
            isForbidden:false,
        }
    },
    async created() {
        this.loadData()
        window.addEventListener('scroll', this.scrollPagenation)
    },
    methods: {
        async loadData() {
            try{
                this.isLoading=true
                let params = {
                    size: this.pageSize,
                    page: this.currentPage
                }
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`, {params})
                const additonalData = response.data.result.content

                if(additonalData.length == 0) {
                    this.isLastPage=true
                    return
                }
                this.userList = [...this.userList, ...additonalData]
                this.currentPage++;
                this.isLoading=false
            } catch(e) {
              if (e.response && e.response.status === 403) {
                console.log("관리자 권한 없음.");
                this.isForbidden = true;
              }else{
                console.log(e)
              }
            }
        },
        scrollPagenation() {
            const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
            if(isBottom && !this.isLoading && !this.isLastPage) {
                this.loadData();
            }
        }
    }
    
}   
</script>
<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="4" md="6">
                <v-card>
                    <v-card-title class="text-h5 text-center">
                        회원가입
                    </v-card-title>
                    <v-card-text>
                        <v-form @keydown.enter="create">
                            <v-text-field
                            label="name"
                            v-model="name"
                            prepend-icon="mdi-account"
                            required
                            />
                            <v-text-field
                            label="email"
                            v-model="email"
                            type="email"
                            prepend-icon="mdi-email"
                            required
                            />
                            <v-text-field
                            label="loginId"
                            v-model="loginId"
                            prepend-icon="mdi-email"
                            required
                            />
                            <v-text-field
                            label="password"
                            v-model="password"
                            type="password"
                            prepend-icon="mdi-lock"
                            required
                            />
                            <v-text-field
                            label="phonNumber"
                            v-model="phoneNumber"
                            prepend-icon="mdi-lock"
                            required
                            />
                            <v-text-field
                            label="nickName"
                            v-model="nickName"
                            prepend-icon="mdi-lock"
                            required
                            />
                            <v-text-field
                            label="blogLink"
                            v-model="blogLink"
                            prepend-icon="mdi-lock"
                            required
                            />
                            <v-text-field
                            label="batch"
                            v-model="batch"
                            prepend-icon="mdi-lock"
                            required
                            />
                            <v-row>
                                <v-col cols="12">
                                    <v-btn color="#c0c1ff" block @click="create()">제출</v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <v-dialog v-model="trueOrFalse" max-width="400px">
        <v-card>
            <v-card-title>
                {{errorMessage}}
            </v-card-title>
            <v-card-actions>
                <v-btn color="c0c1ff" @click="resetModal()">확인</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import axios from 'axios';

export default {
    data() {
        return {
            name:"",
            email:"",
            loginId:"",
            password:"",
            phoneNumber:"",
            nickName:"",
            blogLink:"",
            batch:"",
            trueOrFalse:false,
            errorMessage:""
        }
    },
    methods: {
        async create() {
            try{
                const data = {
                    name:this.name, email:this.email, 
                    loginId:this.loginId, password:this.password, 
                    phoneNumber:this.phoneNumber, nickName:this.nickName, 
                    blogLink:this.blogLink, batch:this.batch
                };
                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/ttt/user/create`, data)
                this.$router.push('/')
            } catch(error) {
                console.log(error)
                this.trueOrFalse=true
                this.errorMessage = error.response.data.status_message
            }

        },
        resetModal() {
            this.trueOrFalse=false
        }
    }
}
</script>
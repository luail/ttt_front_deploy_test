<template>
  <v-container fluid class="page-container">
    <v-row>
      <!-- 사이드 메뉴 -->
      <v-col cols="1">
        <v-navigation-drawer permanent class="sidebar" width="180">
          <v-list>
            <v-list-item v-for="(c, index) in categoryList" :key="index" @click="selectedBoard(c.categoryId)" class="clickable-item">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{c.categoryName}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
      </v-col>

      <!-- 게시물 작성 폼 -->
      <v-col cols="10">
        <v-card class="post-detail">
          <v-card-title>
            <v-container>
              <!-- 카테고리 선택 -->
              <v-select
                v-model="selectedCategoryId"
                :items="categoryList"
                item-title="categoryName"
                item-value="categoryId"
                label="게시판을 선택하세요"
              />

              <!-- 제목 입력 -->
              <v-text-field v-model="title" label="제목을 입력하세요" outlined></v-text-field>
            </v-container>
          </v-card-title>

          <v-divider></v-divider>

          <!-- 본문 작성 -->
          <v-card-text>
            <quill-editor
              ref="quillEditor"
              :disabled="false"
              :value="content"
              :options="editorOptions"
              @input="onEditorChange"
              @ready="onEditorReady"
              @drop="handleImageDrop"
            />
          </v-card-text>

          <!-- 제출 버튼 -->
          <v-card-actions>
            <v-btn color="yellow" class="secondary" @click="postCreate()">제출</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
// 최상단에 추가
import hljs from "highlight.js";
import "highlight.js/styles/tomorrow.css";


export default {
  components: {
    QuillEditor,
  },
  data() {
    return {
      categoryList: [],
      selectedCategoryId: '',
      title: '',
      // contents: '',
      editorInstance: null,
      editorOptions: {
        placeholder: "내용을 입력하세요...",
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'], // 텍스트 스타일
            [{ 'list': 'ordered'}, { 'list': 'bullet' }], // 리스트
            [{color:[]},{background:[]}],
            ['link', 'image'], // 링크, 이미지
            [{ 'align': [] }], // 정렬 옵션
            ['clean'] // 포맷 초기화
          ],
          syntax:{
            highlight : (text) => hljs.highlightAuto(text).value
          },
        },
        formats: [
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'header', 'list', 'bullet', 'script', 'indent', 'direction', 
        'size', 'color', 'background', 'link', 'image', 'align', 'ordered', 'clean'
    ]
      },
      content:"",
     
    }
  },
  
  async created() {
    this.contents ="";
    try {
      const sideBarResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/category/all`);
      const beforeCategoryList= sideBarResponse.data.result;       
      this.categoryList = [{categoryName: "전체게시판", categoryId:0},...beforeCategoryList]
    } catch (error) {
      console.error('카테고리 불러오기 실패:', error);
    }
  },

  computed:{
    editor(){
      return this.$refs.quillEditor.quill;
    },
    contentCode(){
      return hljs.highlightAuto(this.content).value;
    },
  },

  methods: {
    // 사이드게시판 이동
    selectedBoard(boardId){  
        this.$router.push(`/ttt/post/list/${boardId}`);
        },

    async postCreate() {
      try {
        let formData = new FormData();
        formData.append("title", this.title);
        formData.append("contents", this.content);
        formData.append("postCategoryId", this.selectedCategoryId);
        console.log(this.content)
        console.log(this.title)
 
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post/create`, 
          formData, 
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        console.log("게시물 생성 성공:", response.data);
        this.$router.push(`/ttt/post/list/0`);
      } catch (error) {
        console.log('게시물 생성 실패:', error);
      }
    },
    // 에디터가 준비되었을 때 인스터늣 저장
    onEditorReady(editor){
      this.editorInstance = editor;
      console.log("Quill Editor is ready!", this.editorInstance);
    },
   //에디터 변경시 content에 값 저장
    onEditorChange(){
      if(this.editorInstance){
        this.content = this.editorInstance.root.innerHTML;
        console.log(this.content);
      } else{
        console.warn("Editor instance is not ready yet")
      }
    },

    handleImageDrop(event) {
      const file = event.dataTransfer.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const editor = this.$refs.quillEditor.getEditor();
        const range = editor.getSelection();
        editor.insertEmbed(range.index, 'image', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }
}
</script>

<style scoped>
.page-container {
  margin: 0 30px;
}

.sidebar {
  background-color: #f4f4f4;
  border-right: 1px solid #ccc;
}

.post-detail {
  margin: 20px 0;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
}

/* Quill Editor 스타일 */
.ql-editor {
  min-height: 1500px;
  font-size: 16px;

}

</style>
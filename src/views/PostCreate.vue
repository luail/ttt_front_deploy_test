<template>
  <v-container fluid class="page-container">
    <v-row>
      <!-- 사이드 메뉴 -->
      <v-col cols="2">
        <div class="category-sidebar">
          <h3 class="sidebar-title">카테고리</h3>
          <v-list class="category-list pa-0">
            <v-list-item
              v-for="category in categoryList"
              :key="category.categoryId"
              @click="selectedBoard(category.categoryId)"
              :class="{ 'active-category': category.categoryId === selectedCategoryId }"
              class="category-item"
              dense
            >
              <v-list-item-content>
                <v-list-item-title 
                  :class="{ 'selected-text': category.categoryId === selectedCategoryId }"
                >
                  {{ category.categoryName }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </v-col>

      <!-- 게시물 작성 폼 -->
      <v-col cols="9">
        <v-card class="post-detail">
          <v-card-title>
            <v-container>
              <!-- 카테고리 선택 -->
              <v-select
                v-model="selectedCategoryId"
                :items="beforeCategoryList"
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
          <v-card-text style="min-height: 500px">
            <quill-editor
              ref="quillEditor"
              :disabled="false"
              :value="content"
              :options="editorOptions"
              @text-change="onEditorChange"
              @ready="onEditorReady"
              @drop="handleImageDrop"
            />
          </v-card-text>

          <!-- 제출 버튼 -->
          <v-card-actions>
            <v-btn color="purple" variant="elevated" class="secondary white--text" @click="postCreate()">제출</v-btn>
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
      beforeCategoryList: [],
      categoryList: [],
      selectedCategoryId: '',
      title: '',
      // contents: '',
      editorInstance: null,
      editorOptions: {
        placeholder: "내용을 입력하세요...",
        modules: {
          toolbar: {
            container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['image'],
        [{ size: ["small", false, "large", "huge"] }],
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        image: this.handleImageUpload // **툴바의 이미지 버튼을 클릭하면 실행**
      },
          
          },

          syntax:{
            highlight : (text) => hljs.highlightAuto(text).value
          },
        },
        formats: [
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'header', 'list', 'bullet', 'script', 'indent', 'direction',
        'size', 'color', 'background', 'image', 'align', 'ordered', 'clean'
    ]
      },
      content:"",
      attachments:[],

    }
  },
  
  async created() {
    this.contents ="";
    try {
      const sideBarResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/category/all`);
      this.beforeCategoryList= sideBarResponse.data.result;
      this.categoryList = [{categoryName: "전체게시판", categoryId:0},...this.beforeCategoryList]
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
        console.log(this.title);
        console.log(this.content);
        console.log(this.selectedCategoryId);

        if(this.attachments && this.attachments.length > 0){
          this.attachments.forEach(file=>{
            formData.append("attachments",file);
            console.log(this.file)
          })
        }
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post/create`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        console.log("게시물 생성 성공:", response.data);
        this.$router.push(`/ttt/post/list/0`);
      } catch (error) {
        console.log('게시물 생성 실패:', error);
        alert(error.response.data.status_message);
      }
    },
    // 에디터가 준비되었을 때 인스턴스 저장
    onEditorReady(editor){
      this.editorInstance = editor;
      console.log("Quill Editor is ready!", this.editorInstance);
    },
   //에디터 변경시 content에 값 저장
    onEditorChange(){
      if(this.editorInstance){
        this.content = this.editorInstance.root.innerHTML;
      } else{
        console.warn("Editor instance is not ready yet")
      }
    },

    async handleImageUpload(){
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.click();

      input.onchange = async() =>{
        const file = input.files[0];
        if(!file) return;

        const formData = new FormData();
        formData.append("attachments", file);

        try{
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/post/drag-image`,formData,
            { headers: {"Content-Type":"multipart/form-data"}}
          );

          const imageUrl = response.data.result;
          this.attachments.push(file);

          const editor = this.$refs.quillEditor.getQuill();
          const range = editor.getSelection();
          editor.insertEmbed(range.index,"image",imageUrl);

        } catch(error){
          console.log("이미지 업로드 실패",error);
        }
      };
    },


    async handleImageDrop(event) {
      // 퀼에디터의 드롭 동작을 인식하기 위해 기본 드롭동작을 막음
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("attachments",file);

      try{
       const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/post/drag-image`,formData,
        {headers:{"Content-Type":"multipart/form-data"}}
      );
        console.log(response);
        const imageUrl = response.data.result;
        const editor = this.$refs.quillEditor.getQuill();
        const range = editor.getSelection();
        editor.insertEmbed(range.index,"image",imageUrl);

      }catch(error){
        console.log("드래그 이미지업로드 실패",error);
        alert(error.response.data.status_message);
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  margin: 0 30px;
}

.category-sidebar {
  background: white;
  border-radius: 4px;
  overflow: hidden;
  position: sticky;
  top: 80px;
  height: calc(100vh - 100px);
  overflow-y: auto;
}

/* 스크롤바 스타일링 */
.category-sidebar::-webkit-scrollbar {
  width: 6px;
}

.category-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.category-sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.category-sidebar::-webkit-scrollbar-thumb:hover {
  background: #9155FD;
}

.sidebar-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  padding: 16px 20px;
  margin: 0;
  border-bottom: 2px solid #9155FD;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.category-list {
  background: transparent !important;
}

.category-item {
  padding: 12px 20px !important;
  min-height: 0 !important;
  border-left: 3px solid transparent;
}

.active-category {
  background-color: #F4F1FA !important;
  border-left: 3px solid #9155FD;
}

.selected-text {
  color: #9155FD;
  font-weight: 500;
}

.category-item:hover {
  background-color: #F4F1FA !important;
}

/* 기존 스타일 유지 */
.post-detail {
  margin: 20px 0;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
}

::v-deep .ql-editor {
  min-height: 800px;
  font-size: 25px;
}

::v-deep .ql-editor img {
  max-width: 100%;
  height: auto;
  display: inline-block;
}
</style>
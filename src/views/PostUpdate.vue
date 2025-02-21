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

      <!-- 게시물 수정 폼 -->
      <v-col cols="10">
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

          <!-- 본문 수정 -->
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

          <!-- 수정 & 취소 버튼 -->
          <v-card-actions>
            <v-btn color="purple" class="secondary" @click="updatePost()">수정 완료</v-btn>
            <v-btn color="grey" class="secondary ml-2" @click="cancelUpdate()">취소</v-btn>
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
      editorInstance: null,
      editorOptions: {
        placeholder: "내용을 입력하세요...",
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'], // 텍스트 스타일
            [{ 'list': 'ordered'}, { 'list': 'bullet' }], // 리스트
            [{ size: ["small", false, "large", "huge"] }],
            [{color:[]},{background:[]}],
            ['link', 'image'], // 링크, 이미지
            [{ 'align': [] }], // 정렬 옵션
            ['clean'] // 포맷 초기화
          ],
          syntax: {
            highlight: (text) => hljs.highlightAuto(text).value
          },
        },
        formats: [
          'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
          'header', 'list', 'bullet', 'script', 'indent', 'direction', 
          'size', 'color', 'background', 'link', 'image', 'align', 'ordered', 'clean'
        ]
      },
      content: "",
      attachments: [],
      postId: null, // 수정할 게시글 ID 저장
    }
  },

  async created() {
    this.postId = this.$route.params.id; // URL에서 postId 가져오기
    await this.fetchPostDetails();

    try {
      const sideBarResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/category/all`);
      this.beforeCategoryList = sideBarResponse.data.result;
      this.categoryList = [{categoryName: "전체게시판", categoryId:0}, ...this.beforeCategoryList];
    } catch (error) {
      console.error('카테고리 불러오기 실패:', error);
    }
  },

  computed: {
    editor() {
      return this.$refs.quillEditor.quill;
    },
    contentCode() {
      return hljs.highlightAuto(this.content).value;
    },
  },

  methods: {
    // 기존 게시글 정보 불러오기
    async fetchPostDetails() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/detail/${this.postId}`);
        const post = response.data.result;
        console.log(post)
        this.selectedCategoryId = post.categoryId;
        this.title = post.title;
        this.content = post.contents; // 에디터에 기존 내용 로드
//      그런데 quillEditor의 특성상 contents에 html요소가 있어서 뷰에 바로 반영되지않고 시간이 걸리는 문제가 발생
//     그래서 $nextTick이란 것을 사용. Quill에디터 같은 외부 라이브러리에서 데이터를 정확하게 반영할 때 자주 사용하는 객체인듯.
        this.$nextTick(()=>{
          if(this.editorInstance){
            this.editorInstance.root.innerHTML = post.contents;
          }
        }) 

      } catch (error) {
        console.error('게시글 정보 불러오기 실패:', error);
      }
    },

    // 게시글 수정
    async updatePost() {
      try {
        let formData = new FormData();
        formData.append("title", this.title);
        formData.append("contents", this.content);
        formData.append("postCategoryId", this.selectedCategoryId);

        if (this.attachments && this.attachments.length > 0) {
          this.attachments.forEach(file => {
            formData.append("attachments", file);
          });
        }

        await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/post/update/${this.postId}`, 
          formData, 
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log("게시물 수정 성공");
        this.$router.push(`/ttt/post/${this.postId}`);
      } catch (error) {
        console.log('게시물 수정 실패:', error);
      }
    },

    // 수정 취소
    cancelUpdate() {
      this.$router.push(`/ttt/post/${this.postId}`);
    },

    // 에디터 준비 시
    onEditorReady(editor) {
      this.editorInstance = editor;
    },

    // 에디터 변경 감지
    onEditorChange() {
      if (this.editorInstance) {
        this.content = this.editorInstance.root.innerHTML;
      } else {
        console.warn("Editor instance is not ready yet");
      }
    },

    // 이미지 드래그 업로드
    async handleImageDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("attachments", file);

      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/post/drag-image`, formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const imageUrl = response.data.result;
        const editor = this.$refs.quillEditor.getQuill();
        const range = editor.getSelection();
        editor.insertEmbed(range.index, "image", imageUrl);
      } catch (error) {
        console.log("드래그 이미지 업로드 실패", error);
      }
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

::v-deep .ql-editor {
  min-height: 800px;
  font-size: 25px;
}

::v-deep .ql-editor img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
</style>
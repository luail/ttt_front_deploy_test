<template>
<v-app>
  <HeaderComponent/>
  <v-main>
    <router-view/>
  </v-main>
  <FooterComponent/>
</v-app>
</template>



<script>
import HeaderComponent from './components/HeaderComponent.vue';
import FooterComponent from "@/components/FooterComponent.vue";
// import FooterComponent from './components/FooterComponent.vue';
export default{
  components : {
    FooterComponent,
    HeaderComponent
  }
}
</script>

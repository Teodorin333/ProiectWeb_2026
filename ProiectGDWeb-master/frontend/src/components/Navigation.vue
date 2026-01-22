<template>
  <v-app-bar :elevation="2">
    <template v-slot:prepend>
    
    </template>

    <v-app-bar-title>
      <v-img
          :src="require('C:/ProiectTIC/ProiectGDWeb/frontend/src/assets/sanofi_logo.png')"
          class="logo"
          contain
          height = "50"
          width = "100"
        />
    </v-app-bar-title>
    
    
    <router-link class="link" to="/"  style="text-decoration: none; color:black;">Acasa</router-link>|  
    <router-link class="link" to="/cariere"  style="text-decoration: none; color:black">Cariere</router-link>|  
    <router-link class="link" to="/register"  style="text-decoration: none; color:black" >Inregistrare</router-link>
  </v-app-bar>



</template>

<style scoped>
.v-app-bar {
  font-family:Arial, Helvetica, sans-serif;
  color: black; 
  font-weight: bold;
  text-decoration-style: none;
  background-image: url(@/assets/Banner.png);
  background-repeat: no-repeat;
  }

.link{
  margin: 10px;
  font-size: 20px;
}


</style>

<script>
export default {
  name: "Navigation"
};
</script>

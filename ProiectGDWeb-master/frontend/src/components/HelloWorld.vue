<template>
  <div class="app">

  <v-col>
    <v-carousel class="slide">
  <v-carousel-item
    :src="require('@/assets/Pic1.png')"
    cover
    class="Promo1"
  ></v-carousel-item>

  <v-carousel-item
    :src="require('@/assets/Promo2.jpg')"
    cover
  ></v-carousel-item>

  <v-carousel-item
     :src="require('@/assets/Promo3.jpg')"
    cover
  ></v-carousel-item>
</v-carousel>
  </v-col>


  <v-col class="exposure">
    <v-card class="Expo" title="Misiunea noastra - Un mediu sigur" text="Pentru noi, sanatatea nu este doar un scop, ci un angajament. Suntem in continua cautare de metode noi si sigure pentru a inova domeniul studiului de cercetare farmaceutic. Astfel, tratamentele dezvoltate de noi sunt de cea mai inalta calitate."></v-card>
    <v-card class="Expo" title="Deschisi la talente noi" text="Echipele noastre intotdeauna ar beneficia de tineri cercetatori dornici sa ni se alature. Daca esti interesat de o pozitie la Anofi, aplica azi!">
      <v-card-actions>
    <v-btn to="/cariere">Aplica acum</v-btn>
  </v-card-actions>
    </v-card>
    <v-card class="Expo" title="Programul Safe & Private" text="Programul nostru pentru a facilita studiile clinice este aici. In cazul in care esti deja inscris, tot ce trebuie sa faci este sa iti introduci credentialele">
      <v-card-actions>
    <v-btn to="/register">Login</v-btn>
  </v-card-actions>
    </v-card>
  </v-col>

  <p class="copyright">© Anofi 2004-2025 - All rights reserved</p>
    
</div>
</template>

<style scoped>
.v-app-bar {
  font-family:Arial, Helvetica, sans-serif;
  color: black; 
  font-weight: bold;
  text-decoration-style: none;
  /*background-color:#b0abcf;*/
  background-image: url(@/assets/Banner.png);
  background-repeat: no-repeat;
  }


.Promo1{
  display: flex;
  justify-content: center; 
  align-items: center;
}

.Mission{
  background-color: #f5f0fc;
}

.app{
  background-image:  url('@/assets/BG.png');
  background-size: cover; 
  background-position: center;
  background-repeat: no-repeat; 
  height: 135vh; 
  width: 100vw; 
  margin: 0; 
}

.Expo{
  margin-bottom: 15px;
  background-color: #f5f0fc;
}

.copyright{
  text-align: center;
}

/*
.slide{
  display: flex;
  justify-content: center; 
  align-items: center;
}
  */
</style>

<script>

export default {
  name: 'HelloWorld',

  data: () => ({
    
    
  }),
}
</script>

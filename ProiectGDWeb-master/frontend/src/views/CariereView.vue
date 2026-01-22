<template>
  <div class="cariere">
    <h1>{{ pacientOneName }}</h1>
  </div>
</template>

<style scoped>
.cariere{
  background-image:  url('@/assets/BG.png');
  background-size: cover; 
  background-position: center;
  background-repeat: no-repeat; 
  height: 135vh; 
  width: 100vw; 
  margin: 0; 
}
</style>

<script>
export default {
  data() {
    return {
      pacientOneName: '',  
    };
  },
  created() {
    this.fetchPacientOneData();  
  },
  methods: {
    async fetchPacientOneData() {
      try {
        const response = await fetch('http://localhost:3000/get-pacient-one', {
          method: "GET",
          mode: "cors",
          cache: "no-cache",
          headers:{
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        console.log(data);
        if (data && data.nume) {
          this.pacientOneName = data.nume; 
        }
      } catch (error) {
        console.error('Error fetching pacient1 data:', error);
      }
    }
  }
};
</script>
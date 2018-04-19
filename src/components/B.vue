<template>
  <div>
    <p @click="testapi">123</p>
    <p>{{ aaa }}</p>
  </div>
</template>

<script>
import {test} from '../api/api';

export default {
  name: 'B',
  data() {
    return {
      aaa: ''
    };
  },
  methods: {
    testapi() {
      test().then(res => {
        console.log(res);
        this.aaa = res.data;
      });
    }
  }
};
</script>

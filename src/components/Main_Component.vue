<template>
  <div>
    <el-header>
      <p>国服EVE LP计算器</p>
    </el-header>
    <el-main>
      <el-table
        :data="tableData"
        height="950"
        style="width: 100%"
      >
        <el-table-column prop="prize" label="名称" sortable width="250"></el-table-column>
        <el-table-column prop="lp" label="LP" sortable :formatter="formatter"></el-table-column>
      </el-table>
    </el-main>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: "Main_Component",
  props: {},

  data() {
    return {
      tableData: null
    };
  },

  methods:{
    getLPStoreData : function(corporationid){
      var vm = this
      $.getJSON(process.env.BASE_URL + 'LPStore/' + corporationid + '/gallente.json', function (data)
      {
        vm.tableData = data
      })
    }
  },

  created(){
    this.getLPStoreData(1000001)
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

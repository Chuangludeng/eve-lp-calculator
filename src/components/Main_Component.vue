<template>
  <div>
    <el-header>
      <p>国服EVE LP计算器</p>
    </el-header>
    <el-main>
      军团：
      <el-select v-model="selectedCorporation" placeholder="请选择军团" v-on:change = "getLPStoreData">
        <el-option
        v-for="item in corporationData"
        :key="item.name"
        :label="item.name"
        :value="item.id"
        >
        
        </el-option>
      </el-select>
      <el-table
        :data="tableData"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="name" label="名称" sortable width="250"></el-table-column>
        <el-table-column prop="lp_cost" label="忠诚点数" sortable :formatter= "formatterNumber" ></el-table-column>
        <el-table-column prop="quantity" label="数量" sortable></el-table-column>
        <el-table-column prop="isk_cost" :formatter= "formatterNumber" sortable label="兑换所需星币"></el-table-column>
        <el-table-column label="兑换所需物品">
          <template slot-scope="scope">
            <p v-for="item in scope.row.required_items" :key="item.name">{{ item.name + "：" + item.quantity}}</p>
          </template>
        </el-table-column>

        <el-table-column label="吉他出售价" sortable/>
        <el-table-column label="吉他收购价" sortable/>
        <el-table-column label="星币每忠诚点(ISK/LP)" sortable/>
        <el-table-column label="如所需物品在吉他出售价购买，星币每忠诚点(ISK/LP)" width="250" sortable/>
        
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
      tableData: null,
      corporationData: null,
      itemDescription:null
    };
  },

  methods:{
    formatterNumber : function(row, column, cellValue){
      return cellValue.toLocaleString();
    },

    getLPStoreData : function(corporationid){
      var vm = this
      $.getJSON(process.env.BASE_URL + 'LPStore/' + corporationid + '/loyalty.json', function (data)
      {
        data.forEach(element => {
          var item_main = vm.itemDescription.get(element.type_id);
          element.name = item_main.name;
          element.description = item_main.description;

          element.required_items.forEach(i =>{
            var item_request = vm.itemDescription.get(i.type_id);
            i.name = item_request.name;
            i.description = item_request.description;
          });
        });

        vm.tableData = data;
      })
    },

    getCorporationData : function(){
      var vm = this
      $.getJSON(process.env.BASE_URL + 'LPStore/corporation_description.json', function (data)
      {
        vm.corporationData = data
      })
    },

    getItemDescription : function(){
      var vm = this
      $.getJSON(process.env.BASE_URL + 'LPStore/loyalty_description.json', function (data)
      {
        vm.itemDescription = new Map(data);
      })
    }
  },

  created(){
    this.getItemDescription();
    this.getCorporationData();
   // this.getLPStoreData(1000001)
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

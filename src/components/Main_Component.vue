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
      获取数据进度{{curUpdateIndex}}/{{tableData.length}}
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

        <el-table-column prop="sell" label="吉他出售价(单个)" :formatter= "formatterNumber" sortable/>
        <el-table-column prop="buy" label="吉他收购价(单个)" :formatter= "formatterNumber" sortable/>
        <el-table-column prop="lp_rate_buy" label="吉他收购价星币每忠诚点(ISK/LP)" width="200" sortable/>
        <el-table-column prop="lp_rate_sell" label="吉他出售价星币每忠诚点(ISK/LP)" width="200" sortable/>
        <el-table-column prop="lp_rate_buy_all" label="如所需物品在吉他出售价购买，吉他收购价星币每忠诚点(ISK/LP)" width="250" sortable/>
        <el-table-column prop="lp_rate_sell_all" label="如所需物品在吉他出售价购买，吉他出售价星币每忠诚点(ISK/LP)" width="250" sortable/>
        
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
      tableData: [],
      corporationData: null,
      itemDescription:null,
      curUpdateIndex:0
    };
  },

  methods:{
    formatterNumber : function(row, column, cellValue){
      if(typeof(cellValue) == "undefined")
        return "";
      else
        return cellValue.toLocaleString();
    },

    getReqItemData : function(item)
    {
            var item_promise = $.getJSON("http://localhost:8080/api/market/region/10000002/type/"+item.type_id+".json",function (mm_data)
            {
              item.buy = mm_data.buy.max;
              item.sell = mm_data.sell.min;
            });
            return item_promise;
    },

    getLPStoreData : function(corporationid){
      var vm = this
      $.getJSON(process.env.BASE_URL + 'LPStore/' + corporationid + '/loyalty.json', function (data)
      {
        data.forEach(element => {
          var promiseList = [];

          var item_main = vm.itemDescription.get(element.type_id);
          element.name = item_main.name;
          element.description = item_main.description;
          element.buy = 0;
          element.sell = 0;
          element.lp_rate_buy = 0;
          element.lp_rate_sell = 0;
          element.lp_rate_buy_all = 0;
          element.lp_rate_sell_all = 0;

          var main_promise = $.getJSON("http://localhost:8080/api/market/region/10000002/type/"+element.type_id+".json",function (m_data)
            {
              element.buy = m_data.buy.max;
              element.sell = m_data.sell.min;
            });
          promiseList.push(main_promise);

          for(var i = 0;i<element.required_items.length;i++)
          {
            var item = element.required_items[i];
            var item_request = vm.itemDescription.get(item.type_id);
            element.required_items[i].name = item_request.name;
            element.required_items[i].description = item_request.description;
            element.required_items[i].buy = 0
            element.required_items[i].sell = 0

            promiseList.push(vm.getReqItemData(item));
          }

          Promise.all(promiseList)
          .then(() =>
          {
            vm.updateItem(element);
            vm.curUpdateIndex++;
          });
        });

        vm.tableData = data;
      })
    },

    updateItem : function(item)
    {
      item.lp_rate_buy = (item.buy * item.quantity - item.isk_cost) / item.lp_cost;
      item.lp_rate_sell = (item.sell * item.quantity - item.isk_cost) / item.lp_cost;

      var valid = true;
      var req_isk = 0;
      for(var i = 0;i<item.required_items.length;i++)
      {
        var r_item = item.required_items[i];
        
        if(r_item.sell == 0)
        {
          valid = false;
          break;
        }
        else
        {
          req_isk += r_item.sell * r_item.quantity;
        }
      }

      if(valid)
      {
        item.lp_rate_buy_all = (item.buy * item.quantity - item.isk_cost - req_isk) / item.lp_cost;
        item.lp_rate_sell_all = (item.sell * item.quantity - item.isk_cost - req_isk) / item.lp_cost;
      }
      else
      {
        item.lp_rate_buy_all = -99999;
        item.lp_rate_sell_all = -99999;
      }

      if(isNaN(item.lp_rate_buy_all))
      {
        console.assert(false);
      }
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

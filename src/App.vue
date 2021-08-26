<template>
  <div id="app">
    <v-uploader @done="uploadDone" :preview-width="400" :preview-height="300" :button-icon="false"></v-uploader>

    <div id="action">
      <div>
        <button class="button" @click="requestSignIn">绑定钱包</button>
        <span>已绑定账户:{{accountId}},账户余额:{{balance}}</span>
      </div>
      <div>
        <button class="button" @click="getBalance">查看余额</button>
      </div>
      <div>
        <button class="button" @click="viewMeteData">查看mete</button>
      </div>
    </div>
  </div>

</template>

<script>
  import * as nearAPI from 'near-api-js';

  export const { connect, keyStores, WalletConnection, utils } = nearAPI;
  export const config = {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    contractName: 'dev-1629830646346-20918778741136',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org'
  };


  export default {
    data () {
      return {
        near: {},
        accountId: '',
        balance: 0,
        wallet: {},
        contract: {},
        appKeyPrefix:'"near-api-js:keystore:"'
      };
    },

    created () {
      this.initNear()
    },

    onshow () {
      if (this.wallet.isSignedIn()) {
        this.accountId = this.wallet.getAccountId();
      }
    },


    methods: {

      // 初始化 near
      async initNear () {
        this.near = await connect(config);
        this.wallet = new WalletConnection(this.near, this.appKeyPrefix);
        this.accountId = this.wallet.getAccountId();
        const account = await this.near.account('ds119.testnet');
        const detail = await account.getAccountDetails();
        console.log(detail);

        await this.getBalance();

        // 获取合约
        this.contract = new nearAPI.Contract(this.accountId,this.contractName, {
          viewMethods: ['nft_metadata'],
          changeMethods: ['nft_mint'],
          sender: this.accountId
        });

        console.log(this.contract);
        console.log('账户是否登录',this.wallet.isSignedIn());
        console.log('登录账户:',this.wallet.getAccountId());
      },


      // 登录钱包
      async requestSignIn () {
        await this.wallet.requestSignIn(
                this.contractName,
                'Near Demo',
                'http://localhost:8080/'
        );
      },

      // 获取余额
      async getBalance () {
        const account = await this.near.account(this.accountId);
        const res = await account.getAccountBalance();
        const balance = Number(utils.format.formatNearAmount(res.total));
        this.balance = balance.toFixed(2);
        console.log(this.balance);
      },


      // 查看NFT
      async viewMeteData () {
        const response = await this.contract.nft_metadata();
        console.log(response);
      },


      // 铸造NFT
      async requestMint(){
        // await this.contract.new_default_meta(this.accountId);
        await this.contract.nft_mint(
                {
                  token_id: '0',
                  token_owner_id: 'dev-1629830646346-20918778741136',
                  token_metadata:
                          {
                            title: '测试NFT',
                            description: '测试生成一个NFT',
                            copies: 1
                          }
                }

        );
      },


      // 传输NFT
      async transferNFT(){

      },

      // 上传图片
      uploadDone (files) {
        if (files && Array.isArray(files) && files.length) {
          console.log(files);
        }
      },
    }
  };


</script>
<style>

  body{
    font-size: 13px;
  }

  #app{
    width: 400px;
    height: 300px;
    margin-left:  auto;
    margin-right:  auto;
    margin-top: 10%;
  }

  #action{
    margin-top: 30px;
    display: flex;
    flex-direction: column
  }


  #action div{
    margin-top: 20px;
    width: auto;
  }

  .button{
    -webkit-border-radius: 2px;
    -moz-border-radius: 2px;
    border-radius: 2px;
    -webkit-box-shadow: 0 0 2px rgba(0,0,0,.12), 0 2px 2px rgba(0,0,0,.2);
    box-shadow: 0 0 2px rgba(0,0,0,.12), 0 2px 2px rgba(0,0,0,.2);
    -webkit-transition: all .2s ease-in-out;
    -moz-transition: all .2s ease-in-out;
    transition: all .2s ease-in-out;
    color: #212121;
    background: #fff;
    border-color: #fff;
    outline: 0;
    width: 100px;
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    cursor: pointer;
  }
</style>

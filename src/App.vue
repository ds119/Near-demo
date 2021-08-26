<template>
  <div id="app">
    <div>
      <div class="single-upload">
        <div class="image-box">
          <img :src="uploadImg" width="400" height="200">
        </div>
      </div>
    </div>

    <div id="action">
      <div class="flex">
        <div class="button" @click="requestSignIn">绑定钱包</div>
        <div class="text">已绑定账户:{{accountId}}</div>
        <div class="text">账户余额:{{balance}}</div>
      </div>
      <div>
        <div class="button">上传图片</div>
        <input type="file" @change="getImgUrl">
      </div>
      <div>
        <div class="button" @click="requestMint">铸造NFT</div>
      </div>
      <div>
        <div class="button" @click="transferNFT">发送NFT</div>
        <input class="text" type="text">
        <input class="text" type="text">
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
        uploadImg:'https://mms.businesswire.com/media/20210512005215/en/877870/23/near_logo.jpg',
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
        this.account = this.wallet.account();
        // const account = await this.near.account('ds119.testnet');
        // const detail = await account.getAccountDetails();
        // console.log(detail);

        await this.getBalance();

        // 获取合约
        this.contract = new nearAPI.Contract(this.account,'dev-1629830646346-20918778741136', {
          viewMethods: ['nft_metadata'],
          changeMethods: ['new_default_meta','nft_mint','nft_transfer'],
        });

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
      },


      // 查看MeteData
      async viewMeteData () {
        const response = await this.contract.nft_metadata();
        console.log(response);
      },


      // 铸造NFT
      async requestMint(){

        // 初始化合约
        // await this.contract.new_default_meta({
        //   owner_id: this.accountId
        // });

        const res = await this.contract.nft_mint(
                {
                  token_id: '1',
                  token_owner_id: 'dev-1629830646346-20918778741136',
                  token_metadata:
                          {
                            title: '测试NFT',
                            description: '测试生成一个NFT',
                            copies: 1
                          }
                },
                30000000000000
        );
        console.log(res);
      },


      // 传输NFT
      async transferNFT () {
        const res = await this.contract.nft_transfer(
                {
                  token_id: '1',
                  receiver_id: '',
                  memo: ''
                },
                0.000000000000000000000001
        );
        console.log(res);
      },


      // 上传图片获得本机地址
      getImgUrl(event){
        const file = event.target.files[0];
        this.uploadImg = URL.createObjectURL(file);
      }
    }
  };


</script>
<style>

  body{
    font-size: 13px;
  }

  #app{
    width: 500px;
    height: 300px;
    margin-left:  auto;
    margin-right:  auto;
    margin-top: 10%;
  }

  .flex{
    display: flex;
  }

  .text{
    padding-top: 10px;
    margin-left: 20px;
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

  .single-upload {
    display: inline-block;
    margin-right: 5px;
    text-align: center;
  }

  .image-box {
    border-radius: 2px;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #DDDDDD;
    padding: 5px;
    margin-bottom: 10px;
  }

  .button{
    border-radius: 2px;
    box-shadow: 0 0 2px rgba(0,0,0,.12), 0 2px 2px rgba(0,0,0,.2);
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

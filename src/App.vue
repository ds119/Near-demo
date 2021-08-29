<template>
  <div id="app">
    <div>
      <div class="single-upload">
        <div class="image-box">
          <img :src="uploadImg" width="300" height="auto">
        </div>
      </div>
    </div>

    <div id="action">
      <div class="flex">
        <div class="button" @click="requestSignIn">绑定钱包</div>
        <div class="text">已绑定账户:{{accountId}}</div>
        <div class="text">账户余额:{{balance}}</div>
      </div>
      <div class="flex">
        <div><a href="javascript:;" class="file">上传图片<input type="file" @change="getImgUrl"></a></div>
        <input class="img_input" type="text" placeholder="请输入媒体地址" v-model="uploadImg">
      </div>
      <div class="flex">
        <div class="button" @click="requestMint">铸造NFT</div>
        <div v-if="transactionHashes" class="text"><a :href="'https://explorer.testnet.near.org/transactions/'+transactionHashes" target="_blank">{{transactionHashes}}</a></div>
      </div>
      <div>
        <div class="button" @click="transferNFT">发送NFT</div>
        <input class="text_input" type="text" placeholder="请输入接受者帐号" v-model="receiverId">
        <input class="text_input" type="text" placeholder="请输入tokenID" v-model="tokenId">
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
    contractName: 'hiphop200x.testnet',
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
        uploadImg: 'https://mms.businesswire.com/media/20210512005215/en/877870/23/near_logo.jpg',
        appKeyPrefix: '"near-api-js:keystore:"',
        tokenId:'',
        transactionHashes:'',
        receiverId:''
      };
    },

    created () {
      this.initNear();
      this.transactionHashes = this.getQueryString('transactionHashes');
    },

    mounted () {
      if (this.wallet.isSignedIn()) {
        this.accountId = this.wallet.getAccountId();
      }
    },

    methods: {

      // 获得交易返回后的TransactionId
      getQueryString (name) {
        let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        let r = window.location.search.substr(1).match(reg);
        if (r != null) {
          return unescape(r[2]);
        } else {
          return null;
        }
      },

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
        this.contract = new nearAPI.Contract(this.account,'hiphop200x.testnet', {
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
                'http://localhost:8081/'
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
      async requestMint () {
        // 初始化metaData
        // await this.contract.new_default_meta({
        //   owner_id: this.accountId
        // });

        const pushId = new Date().getTime();
        await this.contract.nft_mint(
                {
                  token_id: `${pushId}`,
                  token_owner_id: "hiphop200x.testnet",
                  token_metadata:
                          {
                            title: "测试NFT",
                            description: "测试测试",
                            copies: 1,
                            media: this.uploadImg,
                          }
                },
                200000000000000,
                utils.format.parseNearAmount("0.1")
        );
      },

      // 传输NFT
      async transferNFT () {
        const res = await this.contract.nft_transfer(
                {
                  token_id: `${this.tokenId}`,
                  receiver_id: `${this.receiverId}`,
                  memo: "test"
                },
                200000000000000,
                utils.format.parseNearAmount("0.000000000000000000000001")
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


  .file {
    position: relative;
    display: inline-block;
    background: #fff;
    border-color: #fff;
    box-shadow: 0 0 2px rgba(0,0,0,.12), 0 2px 2px rgba(0,0,0,.2);
    border-radius: 2px;
    padding: 6px 12px;
    overflow: hidden;
    font-size: 14px;
    color: #212121;
    text-decoration: none;
    text-indent: 0;
    line-height: 1.42857143;
    cursor: pointer;
  }
  .file input {
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
  }

  .text_input{
    height: 28px;
    border: 1px solid #DDDDDD;
    margin-left: 20px;
  }

  .img_input{
    height: 28px;
    border: 1px solid #DDDDDD;
    margin-left: 20px;
    width: 360px;
    margin-top: 20px;
  }


</style>

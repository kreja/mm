import React from 'react';
import ReactDOM from 'react-dom';
import { LocaleProvider, message, Input, Button, Form } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import './index.css';

moment.locale('zh-cn');
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};
const formTailLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8, offset: 4 },
};

const dappAddress = "n1h3Tzr1Ju91Z9wboTyvnMVFXCqmv7XfVYK";
const Account = nebulas.Account;
const neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

function genStyle(index) {
  const bgs = [
    'rgba(159, 162, 91, 0.9)',
    'rgba(214, 136, 59, 0.8)',
    'rgba(249, 237, 133, 0.8)',
    'rgba(171, 113, 92, 0.8)',
    'rgba(218, 138, 121, 0.9)',
  ];
  const decoCount = 5;
  const random = Math.random();

  let style =  {
    background: `${bgs[Math.floor(random * bgs.length)]} url('./img/deco${Math.floor(random * decoCount)}.png') no-repeat 0 20px`,
    top: `${random > 0.5 ? '+' : '-'}${Math.floor(random * 100)}px`
  };

  if (index % 2 == 0 ) {
    style.left = `${Math.floor(random * 100) + 200}px`;
  } else {
    style.right = `${Math.floor(random * 100) + 200}px`;
  }

  return style;
}

function genStyleBg() {
  const bgs = [
    './img/1.jpg',
    './img/2.jpg',
    './img/3.jpg',
    './img/4.jpg',
    './img/5.jpg',
    './img/6.jpg',
    './img/7.jpg',
    './img/8.jpg',
    './img/9.jpg',
  ];
  let random = Math.random();
  let img = bgs[Math.floor(random * bgs.length)];

  let style =  {
    backgroundImage: `url(${img})`,
  };

  return style;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loading: false,
      showAdd: false,
      showWebExtensionWalletTip: false
    };
  }

  componentDidMount() {
    this.getList();
  }

  showError = (msg) => {
    msg && message.error(msg);
  }

  getList = () => {
    this.setState({
      loading: true
    });

    var from = Account.NewAccount().getAddressString();

    var value = "0";
    var nonce = "0";
    var gas_price = "1000000";
    var gas_limit = "2000000";
    var callFunction = "getlist";
    var callArgs = `["1", "100"]`; // in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    };

    neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then((resp) => {
      this.setState({
        loading: false
      });

      var result = resp && resp.result;

      if (result && result != 'null') {
        try{
          result = JSON.parse(result)
        }catch (err){
          this.showError('数据解析失败');
        }

        // 有数据
        if (result && result.total){
          let list = result.list.filter(item => !!item);
          list.map((item, index) => {
            return Object.assign(item, {
              style: genStyle(index),
              styleBg: genStyleBg()
            });
          });
          this.setState({
            list 
          });
        }
      }
    }).catch((err) => {
      this.setState({
        loading: false
      });
      this.showError(err.message);
    })
  }

  save = () => {
    const { form } = this.props;
    let hasError = false;
    form.validateFields((errors) => {
      if (errors) {
        hasError = true;
      }
    });

    if (hasError) {
      return;
    }

    const { content } = form.getFieldsValue();

    // todo::检测钱包
    var nebPay = new NebPay();
    var serialNumber;
    var to = dappAddress;
    var value = '0';
    var callFunction = 'setSecret';
    var callArgs = `["${content}"]`;

    serialNumber = nebPay.call(to, value, callFunction, callArgs, {
      listener: (resp) => {
        console.log("交易返回: " + JSON.stringify(resp))

        if (resp && resp.txhash) {
        } else {
          // message.error('发布终止');
        }
      }
    });

    let intervalQuery = setInterval(() => {
      nebPay.queryPayInfo(serialNumber)
        .then((resp) => {
          console.log("交易结果: " + resp);
          var respObject = JSON.parse(resp);

          if(respObject.code === 0){
            message.success('发布成功！');
            this.getlist();
            clearInterval(intervalQuery);
          }
        })
        .catch((err) => {
          clearInterval(intervalQuery);
          message.success(err);
        });
    }, 5000);
  }

  switchShowAdd = () => {
    this.setState({
      showAdd: !this.state.showAdd,
      showWebExtensionWalletTip: typeof(webExtensionWallet) === "undefined"
    });
  }

  renderItem = (content) => {
    return (
      <div className="post-it">
        <p className="sticky taped">{content}</p>
      </div>
    );
  }

  render() {
    const { list, loading, showAdd, showWebExtensionWalletTip } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <LocaleProvider locale={zhCN}>
        <div className="main-page">
          <div className="hd-wrapper">
            <div className={`hd ${showAdd && !showWebExtensionWalletTip ? 'tall' : ''}`}>
              <img className="mm-logo" src="./img/logo.png"/>
              <h1 className="page-title">秘密花园</h1>
              <h1 className="page-subtitle">没有出卖与背叛</h1>
              <div className="box-tip">
                <button className="app-btn" type="primary" onClick={this.switchShowAdd}>{ showAdd ? '收起' : '写秘密'}</button>
              </div>
              <div className="alert-wallet">
                {
                  showAdd && showWebExtensionWalletTip && <div>请先安装<a className="wallet-link" href="https://github.com/ChengOrangeJu/WebExtensionWallet">钱包插件</a>，再写秘密</div>
                }
              </div>
              {
                showAdd && !showWebExtensionWalletTip && <Form className="form-secret">
                  <FormItem {...formItemLayout} label="">
                    {getFieldDecorator('content', {
                      rules: [{
                        required: true,
                        message: '请输入你的秘密',
                      }],
                    })(
                      <Input.TextArea rows={6} autosize={{ minRows: 6, maxRows: 6 }} placeholder="请输入你的秘密" />
                    )}
                  </FormItem>
                  <FormItem  {...formTailLayout}>
                    <Button className="app-btn" type="primary" onClick={this.save}>确认提交</Button>
                  </FormItem>            
                </Form>
              }
            </div>
          </div>

          {
            list.map((item, index) => {
              console.log(item)
              return (
                <div className="block" style={item.styleBg} key={index}>
                  <div className="text" style={item.style}>
                    <div>{item.content}</div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </LocaleProvider>
    );
  }
}

const WrappedDynamicApp = Form.create()(App);
ReactDOM.render(<WrappedDynamicApp />, document.getElementById('root'));
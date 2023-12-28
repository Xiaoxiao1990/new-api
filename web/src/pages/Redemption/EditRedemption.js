import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {API, downloadTextAsFile, isMobile, showError, showSuccess} from '../../helpers';
import { getQuotaPerUnit, renderQuota, renderQuotaWithPrompt } from '../../helpers/render';
import {SideSheet, Space, Spin, Button, Input, Typography, AutoComplete, Modal} from "@douyinfe/semi-ui";
import Title from "@douyinfe/semi-ui/lib/es/typography/title";
import {Divider} from "semantic-ui-react";

const EditRedemption = (props) => {
  const isEdit = props.editingRedemption.id !== undefined;
  const [loading, setLoading] = useState(isEdit);

  const params = useParams();
  const navigate = useNavigate()
  const originInputs = {
    name: '',
    quota: 100000,
    count: 1
  };
  const [inputs, setInputs] = useState(originInputs);
  const { name, quota, count } = inputs;

  const handleCancel = () => {
    props.handleClose();
  }
  
  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const loadRedemption = async () => {
    setLoading(true);
    let res = await API.get(`/api/redemption/${props.editingRedemption.id}`);
    const { success, message, data } = res.data;
    if (success) {
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isEdit) {
      loadRedemption().then(
          () => {
            // console.log(inputs);
          }
      );
    } else {
      setInputs(originInputs);
    }
  }, [props.editingRedemption.id]);

  const submit = async () => {
    if (!isEdit && inputs.name === '') return;
    setLoading(true);
    let localInputs = inputs;
    localInputs.count = parseInt(localInputs.count);
    localInputs.quota = parseInt(localInputs.quota);
    let res;
    if (isEdit) {
      res = await API.put(`/api/redemption/`, { ...localInputs, id: parseInt(props.editingRedemption.id) });
    } else {
      res = await API.post(`/api/redemption/`, {
        ...localInputs
      });
    }
    const { success, message, data } = res.data;
    if (success) {
      if (isEdit) {
        showSuccess('兑换码更新成功！');
        props.refresh();
        props.handleClose();
      } else {
        showSuccess('兑换码创建成功！');
        setInputs(originInputs);
        props.refresh();
        props.handleClose();
      }
    } else {
      showError(message);
    }
    if (!isEdit && data) {
      let text = "";
      for (let i = 0; i < data.length; i++) {
        text += data[i] + "\n";
      }
      // downloadTextAsFile(text, `${inputs.name}.txt`);
      Modal.confirm({
        title: '兑换码创建成功',
        content: (
            <div>
                <p>兑换码创建成功，是否下载兑换码？</p>
                <p>兑换码将以文本文件的形式下载，文件名为兑换码的名称。</p>
            </div>
        ),
        onOk: () => {
            downloadTextAsFile(text, `${inputs.name}.txt`);
        }
      });
    }
    setLoading(false);
  };

  return (
    <>
      <SideSheet
          placement={isEdit ? 'right' : 'left'}
          title={<Title level={3}>{isEdit ? '更新兑换码信息' : '创建新的兑换码'}</Title>}
          headerStyle={{borderBottom: '1px solid var(--semi-color-border)'}}
          bodyStyle={{borderBottom: '1px solid var(--semi-color-border)'}}
          visible={props.visiable}
          footer={
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <Space>
                <Button theme='solid' size={'large'} onClick={submit}>提交</Button>
                <Button theme='solid' size={'large'} type={'tertiary'} onClick={handleCancel}>取消</Button>
              </Space>
            </div>
          }
          closeIcon={null}
          onCancel={() => handleCancel()}
          width={isMobile() ? '100%' : 600}
      >
        <Spin spinning={loading}>
          <Input
              style={{ marginTop: 20 }}
              label='名称'
              name='name'
              placeholder={'请输入名称'}
              onChange={value => handleInputChange('name', value)}
              value={name}
              autoComplete='new-password'
              required={!isEdit}
          />
          <Divider/>
          <div style={{ marginTop: 20 }}>
            <Typography.Text>{`额度${renderQuotaWithPrompt(quota)}`}</Typography.Text>
          </div>
          <AutoComplete
              style={{ marginTop: 8 }}
              name='quota'
              placeholder={'请输入额度'}
              onChange={(value) => handleInputChange('quota', value)}
              value={quota}
              autoComplete='new-password'
              type='number'
              position={'bottom'}
              data={[
                { value: `${1 * getQuotaPerUnit()}`, label: '1$'},
                {value: `${10 * getQuotaPerUnit()}`, label: '10$'},
                {value: `${50 * getQuotaPerUnit()}`, label: '50$'},
                {value: `${100 * getQuotaPerUnit()}`, label: '100$'},
                {value: `${500 * getQuotaPerUnit()}`, label: '500$'},
                {value: `${1000 * getQuotaPerUnit()}`, label: '1000$'},
              ]}
          />
          {
              !isEdit && <>
                <Divider/>
                <Typography.Text>生成数量</Typography.Text>
                <Input
                    style={{ marginTop: 8 }}
                    label='生成数量'
                    name='count'
                    placeholder={'请输入生成数量'}
                    onChange={value => handleInputChange('count', value)}
                    value={count}
                    autoComplete='new-password'
                    type='number'
                />
              </>
          }
        </Spin>
      </SideSheet>
    </>
  );
};

export default EditRedemption;

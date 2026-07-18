import * as Merchant from '../models/Merchant.js';

// 获取商家信息
export const getMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.getMerchant();
    if (!merchant) {
      return res.json({ code: 200, data: null, message: '暂无商家信息' });
    }
    res.json({ code: 200, data: merchant, message: '获取成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 更新商家信息
export const updateMerchant = async (req, res) => {
  try {
    const { name, address, contactPerson, phone, email, businessLicense } = req.body;

    if (!name || !contactPerson || !phone) {
      return res.status(400).json({ code: 400, data: null, message: '商家名称、联系人、联系电话为必填项' });
    }

    const updated = await Merchant.updateMerchant({
      name,
      address: address || '',
      contactPerson,
      phone,
      email: email || '',
      businessLicense: businessLicense || ''
    });
    res.json({ code: 200, data: updated, message: '商家信息更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

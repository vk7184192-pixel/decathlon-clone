import Address from "../models/Address.js";

const addAddress = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      mobile,
      houseBuilding,
      streetLocality,
      landmark,
      pincode,
      cityState,
      addressType,
      isDefault,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !mobile ||
      !houseBuilding ||
      !streetLocality ||
      !pincode ||
      !cityState
    ) {
      return res.status(400).json({
        message: "Please fill all required address fields",
      });
    }

    // Only one default address per user
    if (isDefault === true) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      user: req.user.id,
      firstName,
      lastName,
      mobile,
      houseBuilding,
      streetLocality,
      landmark: landmark || "",
      pincode,
      cityState,
      addressType: addressType || "Home",
      isDefault: isDefault || false,
    });

    res.status(201).json({
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.id,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      mobile,
      houseBuilding,
      streetLocality,
      landmark,
      pincode,
      cityState,
      addressType,
      isDefault,
    } = req.body;

    const address = await Address.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    if (isDefault === true) {
      await Address.updateMany(
        {
          user: req.user.id,
          _id: { $ne: id },
        },
        {
          $set: { isDefault: false },
        }
      );
    }

    if (firstName !== undefined) address.firstName = firstName;
    if (lastName !== undefined) address.lastName = lastName;
    if (mobile !== undefined) address.mobile = mobile;
    if (houseBuilding !== undefined) {
      address.houseBuilding = houseBuilding;
    }
    if (streetLocality !== undefined) {
      address.streetLocality = streetLocality;
    }
    if (landmark !== undefined) {
      address.landmark = landmark;
    }
    if (pincode !== undefined) address.pincode = pincode;
    if (cityState !== undefined) address.cityState = cityState;
    if (addressType !== undefined) {
      address.addressType = addressType;
    }
    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    await address.save();

    res.status(200).json({
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    await Address.findByIdAndDelete(id);

    res.status(200).json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export { addAddress, getAddresses, updateAddress, deleteAddress };
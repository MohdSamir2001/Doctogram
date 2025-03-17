const validateAddDoctorDetails = (req) => {
  const {
    name,
    email,
    password,
    image,
    speciality,
    degree,
    experience,
    about,
    available,
    fees,
    address,
    date,
    slots_booked,
  } = req.body;

  const requiredFields = {
    name,
    email,
    password,
    speciality,
    degree,
    experience,
    about,
    fees,
    address,
  };
  // date,
  // slots_booked,
  // available,
  // image,
  const missingFields = Object.entries(requiredFields).filter(
    ([key, value]) => !value
  );
  return missingFields;
};
const validateMedicineDetails = (req) => {
  const {
    name,
    includeSalts,
    description,
    noOfTablets,
    price,
    category,
    stock,
    manufacturer,
    expiryDate,
    prescriptionRequired,
    dosage,
    form,
  } = req.body;
  const requiredFields = {
    name,
    description,
    noOfTablets,
    price,
    category,
    stock,
    includeSalts,
    manufacturer,
    expiryDate,
    prescriptionRequired,
    dosage,
    form,
  };
  // console.log({
  //   name,
  //   description,
  //   noOfTablets,
  //   price,
  //   category,
  //   stock,
  //   image,
  //   manufacturer,
  //   expiryDate,
  //   prescriptionRequired,
  //   dosage,
  //   form,
  // });
  console.log(requiredFields);
  const missingFields = Object.entries(requiredFields).filter(
    ([key, value]) => !value
  );
  return missingFields;
};
module.exports = { validateAddDoctorDetails, validateMedicineDetails };

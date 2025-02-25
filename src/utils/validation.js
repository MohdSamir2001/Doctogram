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
  const imageFile = req.file;
  const requredFields = {
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
    imageFile,
  };
  const missingFields = Object.entries(requredFields).filter(
    ([key, value]) => !value
  );
  return missingFields;
};
module.exports = validateAddDoctorDetails;

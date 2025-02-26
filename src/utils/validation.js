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

  const requredFields = {
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
  const missingFields = Object.entries(requredFields).filter(
    ([key, value]) => !value
  );
  return missingFields;
};
module.exports = validateAddDoctorDetails;

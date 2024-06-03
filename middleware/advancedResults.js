const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  //copy req.query
  const reqQuery = { ...req.query };
  //fields to exculde
  const removeFields = ["select", "sort", "page", "limit", "search"];

  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  //create query string
  let queryStr = JSON.stringify(reqQuery);
  // create operators ($gt, $gte)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // // Search
  // searchFind = {};
  // searchSort = {};
  // if (req.query.search) {
  //   const searchQuery = req.query.search.split(",").join(" ");
  //   console.log({ searchQuery });
  //   searchFind = { $text: { $search: searchQuery } };
  //   searchSort = { score: { $meta: "textScore" } };
  // }

  //finding resource
  // query = model.find({...JSON.parse(queryStr), ...searchFind});
  query = model.find(JSON.parse(queryStr));

  // Search
  if (req.query.search) {
    const searchQuery = req.query.search.split(",").join(" ");
    console.log({ searchQuery });
    query.find({ $text: { $search: searchQuery } });
    query.sort({ score: { $meta: "textScore" } });
  }

  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    // query = query.sort(sortBy).sort(searchSort);
    query = query.sort(sortBy);
  } else {
    // query = query.sort("-createdAt").sort(searchSort);
    query = query.sort("-createdAt");
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page === 0 ? 0 : page - 1) * limit;
  const endIndex = page * limit;
  let total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  //execute query
  const results = await query;

  //pagination result
  const pagination = {};

  pagination.offset = endIndex;

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.advancedResults = {
    success: true,
    count: total,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;

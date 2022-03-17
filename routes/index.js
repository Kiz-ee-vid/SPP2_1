import express from 'express';
import {v4 as uuidv4} from "uuid";
import multer from "multer";
import fs from "fs";

const router = express.Router();
const upload = multer({dest: "./public/uploads"});

let tasks = [];

/* GET home page. */
router.get('/', function(req, res) {
  const search = req.query.search;
  const status = req.query.status;

  const filter = (tasks, search, status) => {
    let result = tasks;

    if (search) {
      result = filterByName(result, search);
    }
    if (status) {
      result = filterByStatus(result, status);
    }

    return result;
  }

  const filterByName = (tasks, search) => {
    return tasks.filter(item => item.name.includes(search))
  }

  const filterByStatus = (tasks, status) => {
    switch (status) {
      case "completed": {
        return tasks.filter(item => item.completed);
      }
      case "not_completed": {
        return tasks.filter(item => !item.completed);
      }
      case "none":
      default:
      {
        return tasks;
      }
    }
  }

  res.render('index', {
    title: "Tasks",
    search: search,
    status: status,
    tasks: filter(tasks, search, status)
  });
});

/* POST cancel search (clear params) */
router.post('/cancel_search', function (req, res) {
  res.redirect("/")
})

/* POST add task */
router.post("/add_task", upload.any(), function (req, res) {
  const taskName = req.body.name;
  const date = req.body.date;
  const files = req.files;

  tasks.push({id: uuidv4(), name: taskName, date: date, completed: false, files: files});

  res.redirect("/");
})

/* POST remove task */
router.post("/remove_task", function (req, res) {
  const taskId = req.body.id;
  tasks = tasks.filter((item) => {
    if (item.id === taskId) {
      for (let i = 0; i < item.files.length; i++) {
        fs.unlinkSync(item.files[i].path);
      }
      return false;
    }
    return true;
  })
  res.redirect("/");
})

/* POST change task completion state */
router.post("/change_status", function (req, res) {
  const taskId = req.body.id;
  tasks = tasks.map((item) => {
    if (item.id === taskId) {
      item.completed = !item.completed;
    }
    return item;
  })
  res.redirect("/");
})

/* POST change task name */
router.post("/change_name", function (req, res) {
  const taskId = req.body.id;
  const name = req.body.name;

  tasks = tasks.map((item) => {
    if (item.id === taskId) {
      item.name = name;
    }
    return item;
  })

  res.redirect("/");
})

/* POST add task files */
router.post("/add_files", upload.any(), function (req, res) {
  const taskId = req.body.id;
  const newFiles = req.files;

  if (newFiles) {
    tasks = tasks.map((item) => {
      if (item.id === taskId) {
        item.files = item.files.concat(newFiles);
      }
      return item;
    })
  }
  res.redirect("/");
})

router.post("/download_file", function (req, res) {
  const path = req.body.path;
  const name = req.body.name;

  if (path) {
    res.download(path, name);
  }
})

/* POST remove task file */
router.post("/remove_file", function (req, res) {
  const taskId = req.body.id;
  const path = req.body.path;

  if (path) {
    tasks = tasks.map((item) => {
      if (item.id === taskId) {
        item.files = item.files.filter(file => {
          if (file.path === path) {
            fs.unlinkSync(path);
            return false;
          }
          return true;
        });
      }
      return item;
    })
  }
  res.redirect("/");
})

/* POST change task date */
router.post("/change_date", function (req, res) {
  const taskId = req.body.id;
  const date = req.body.date;

  if (date) {
    tasks = tasks.map((item) => {
      if (item.id === taskId) {
        item.date = date;
      }
      return item;
    })
  }
  res.redirect("/");
})

export default router;

using custom_service.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace custom_service.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Message = "Modify this template to jump-start your ASP.NET MVC application.";

            return View();
        }


        #region TODO move all to api controller
        static List<Person> _persons = GetPersons();

        private static List<Person> GetPersons()
        {
            var rand = new Random(DateTime.Now.Millisecond);
            var count = 20;
            var res = new List<Person>(count);
            for (var i = 0; i < count; i++)
            {
                res.Add(new Person()
                {
                    AboutMe = "aboutme_" + i,
                    Age = 10 + rand.Next(100),
                    FirstName = "Billy_" + i,
                    LastName = "Coolest",
                    Id = i
                });
            }
            return res;
        }

        // GET api/list
        [HttpGet]
        public JsonResult List()
        {
            return Json(_persons,JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// TODO make it right
        /// add validation on server side
        /// add null checking
        /// make return
        /// </summary>
        /// <param name="id"></param>
        /// <param name="person"></param>
        /// <returns></returns>
        [HttpPut]
        public JsonResult putPerson(int id, Person person)
        {
            
            //simple swap
            var oldPerson = _persons.FirstOrDefault(p => p.Id == id);
            if (oldPerson != null)
                _persons.Remove(oldPerson);

            _persons.Add(person);
           
            return null;
        }

        #endregion
    }
}

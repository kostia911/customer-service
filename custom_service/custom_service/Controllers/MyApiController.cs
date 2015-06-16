using custom_service.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace custom_service.Controllers
{
    public class MyApiController : ApiController
    {

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
                    AboutMe="aboutme_"+i,
                    Age=10+rand.Next(100),
                    FirstName="Billy_"+i,
                    LastName="Coolest",
                    Id=i
                });
            }
            return res;
        }

        // GET api/list
        [HttpGet]
        public IEnumerable<Person> List()
        {
            return _persons;
        }

        // GET api/api/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/api
        public void Post([FromBody]string value)
        {
        }

        // PUT api/api/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/api/5
        public void Delete(int id)
        {
        }
    }
}

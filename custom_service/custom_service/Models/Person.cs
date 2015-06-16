using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace custom_service.Models
{
    public class Person
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int Position { get; set; }
        public string AboutMe { get; set; }
        public int Age { get; set; }
    }
}

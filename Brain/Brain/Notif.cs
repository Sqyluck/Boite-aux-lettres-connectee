using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Brain
{
    class Notif
    {
        public Boolean type;
        public int year;
        public int month;
        public int day;
        public int hour;
        public int minute;
        //type :  true=courrier     false=colis
        public Notif( Boolean type, DateTime date)
        {
            this.type = type;
            this.year = date.Year;
            this.month = date.Month;
            this.day = date.Day;
            this.hour = date.Hour;
            this.minute = date.Minute;
        }
    }
}

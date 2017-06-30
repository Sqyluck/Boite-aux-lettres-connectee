using Constellation;
using Constellation.Package;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.ComponentModel;
using System.IO;
using Newtonsoft.Json;

namespace Brain
{
    public class Program : PackageBase
    {
        private List<User> Users;
        private List<Notif> Notifs;

        [StateObjectLink("ESP8266_Package", "badge")]
        public StateObjectNotifier UID { get; set; }

        private DateTime nextTime = new DateTime();
        private const int waitTimeLetters = 10; //wait x seconds without letter to push another stateObject to avoid too much notification
        private DateTime nextTimeUID = new DateTime();
        private const int waitTimeUid = 3; //wait x seconds before badging again to avoid an instant "open/close the door".
        public Boolean ActivateMotor = false;
         


        static void Main(string[] args)
        {
            PackageHost.Start<Program>(args);
        }

        public override void OnStart()
        {
            PackageHost.WriteInfo("Package starting - IsRunning: {0} - IsConnected: {1}", PackageHost.IsRunning, PackageHost.IsConnected);
            Users = new List<User>();
            Notifs = new List<Notif>();
            nextTime = DateTime.Now;
            nextTimeUID = DateTime.Now;

            this.loadUsers();
            initializeStateObject();
            while (PackageHost.IsRunning)
            {

            }
        }

        public override void OnPreShutdown()
        {
            saveUsers();
        }

        public void initializeStateObject()
        {
            PackageHost.PushStateObject("Users", Users);
            PackageHost.PushStateObject("Notification", Notifs);
            PackageHost.PushStateObject("ActivateMotor", ActivateMotor);
            PackageHost.PushStateObject("UserCollect", "");
            PackageHost.PushStateObject("newUser", "", lifetime: 10);
        }

        public void loadUsers()
        {
            string line;
            string url = @"C:\Luc\cours\Brain\Brain\UsersSave.txt";

            StreamReader file = new StreamReader(url);
            while ((line = file.ReadLine()) != null)
            {
                string uid = line;
                string client = file.ReadLine();
                Boolean b;
                string firstName = file.ReadLine();
                string name = file.ReadLine();
                if (client == "True")
                {
                    b = true;
                }
                else
                {
                    b = false;
                }
                Users.Add(new User(uid, b, firstName, name));
            }
        }
        public void saveUsers() {
            List<string> save = new List<string>();
            StreamWriter file = new StreamWriter(@"C:\Luc\cours\Brain\Brain\UsersSave.txt");

            foreach (User user in Users)
            {
                file.WriteLine(user.uid);
                file.WriteLine(user.client.ToString());
                file.WriteLine(user.firstName);
                file.WriteLine(user.name);
            }

            file.Close();
        }

        /// <summary>
        /// Deletes all users.
        /// </summary>
        [MessageCallback]
        public void deleteAllUsers()
        {
            this.Users.Clear();
            saveUsers();
            PackageHost.PushStateObject("Users", Users);
        }

        /// <summary>
        /// called when a letter is detected.
        /// </summary>
        [MessageCallback]
        public void Message()
        {
            if(nextTime.AddSeconds(waitTimeLetters) < DateTime.Now)
            {
                PackageHost.WriteInfo("du courrier est arrivé");
                Notifs.Add(new Notif(true, DateTime.Now));
                PackageHost.CreateMessageProxy("PushBullet").PushNote("Intergalactical Box", "Vous avez reçu un courrier");
                PackageHost.PushStateObject("Notification", Notifs);
                PackageHost.PushStateObject("UserCollect", "");
            }
            nextTime = DateTime.Now;
        }
        public void pushOnConstellation()
        {
            PackageHost.PushStateObject("Notification", Notifs);
        }

        public void changeMotor()
        {
            if (ActivateMotor)
            {
                ActivateMotor = false;
                PackageHost.WriteInfo("porte fermée");
            }
            else
            {
                ActivateMotor = true;
                PackageHost.WriteInfo("porte ouverte");
            }
            PackageHost.PushStateObject("ActivateMotor", ActivateMotor);
        }

        /// <summary>
        /// Authorisaations the specified uid.
        /// </summary>
        /// <param name="UID">The uid.</param>
        [MessageCallback]
        public void Authorisation(string UID) {
            int id = findUser(UID);
            if (id != -1) 
                {
                if (nextTimeUID.AddSeconds(waitTimeUid) < DateTime.Now)
                {
                    changeMotor();
                    nextTimeUID = DateTime.Now;

                    if (ActivateMotor)
                    {
                        if (this.Users[id].client)
                        {
                            Notifs = new List<Notif>();
                            PackageHost.WriteInfo($"{this.Users[id].firstName} {this.Users[id].name} a récupéré le courrier");
                            PackageHost.PushStateObject("UserCollect", Users[id]);
                            PackageHost.CreateMessageProxy("PushBullet").PushNote("Intergalactical Box", $"{this.Users[id].firstName} {this.Users[id].name} a récupéré le courrier");
                            pushOnConstellation();
                        }
                        else
                        {
                            Notifs.Add(new Notif(false, DateTime.Now));
                            PackageHost.WriteInfo("un colis est arrivé");
                            PackageHost.CreateMessageProxy("PushBullet").PushNote("Intergalactical Box", "Vous avez reçu un colis");
                            PackageHost.PushStateObject("UserCollect", "");
                            pushOnConstellation();
                        }
                    }
                }
            }
            else {
                PackageHost.PushStateObject("newUser", UID, lifetime:10);
                PackageHost.WriteInfo($"badge : {UID} non connu");
            }


        }

        /// <summary>
        /// Adds the user.
        /// return 1: ok / 2: missing information / 3 : already exists
        /// </summary>
        /// <param name="uid">The uid.</param>
        /// <param name="type">client if set to <c>true</c>.</param>
        /// <param name="firstName">The first name.</param>
        /// <param name="name">The name.</param>
        [MessageCallback]
        public int AddUser(string uid, Boolean type, string firstName, string name)
        {
            if ((firstName == "")|| (name == "")){
                return 2;
            }
            int id = FindUser(firstName, name);
            if (findUID(uid))
            {
                return 4;
            }
            if (id == -1)
            {
                Users.Add(new User(uid, type, firstName, name));
                PackageHost.WriteInfo("ajout carte validé");
                PackageHost.PushStateObject("Users", Users);
                saveUsers();
                return 1;
            }
            return 3;
        }

        private Boolean findUID(string uid)
        {
            foreach(User user in Users)
            {
                if(user.uid == uid)
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Deletes the user.
        /// </summary>
        /// <param name="uid">The uid.</param>
        /// <param name="type">client if set to <c>true</c>.</param>
        /// <param name="firstName">The first name.</param>
        /// <param name="name">The name.</param>
        [MessageCallback]
        public void DeleteUser(string firstName, string name)
        {
            int id = FindUser(firstName, name);
            if(id!=-1){
                Users.Remove(Users[id]);
                PackageHost.WriteInfo($"le compte de {firstName} {name} a été supprimé");

                PackageHost.PushStateObject("Users", Users);
                saveUsers();
            }
        }

        public int FindUser(string firstName, string name) {
            for (int i = 0; i < this.Users.Count; i++)
            {
                if ((Users[i].name == name) && (Users[i].firstName == firstName))
                {
                    return i;
                }
            }
            return -1;
        }

        public int findUser(string uid)
        {
            for(int i = 0; i < this.Users.Count; i++)
            {
                if (uid == Users[i].uid)
                {
                    return i;
                }
            }
            return -1;
        }
    }
}

class AppEventService extends EventTarget {
   
   /**
    * Dispatch event
    * @param {string} evname - Event name
    * @param {CustomEventInit} [detail] - Event detail
    * @returns {CustomEvent}
    */
   emit(evname, detail = undefined) {
      if (!detail) {
         detail = this;
      }
      return this.dispatchEvent(new CustomEvent(evname, { detail }));
   }
}

class AvatarService extends AppEventService {
   constructor () {
      super();

      this.$avatars = [];
      this.$loaded = false;
   }

   /**
    * Avatar source file
    * @returns {string}
    */
   get sourceFileUrl () {
      return `${window.location.href}avatars.json`;
   }

   /**
    * Get avatars
    * @returns {string[]}
    */
   get avatars () {
      return this.$avatars;
   }

   /**
    * Total number of avatars
    * @returns {number}
    */
   get length () {
      return this.$avatars.length;
   }

   /**
    * Loading state
    * @returns {boolean}
    */
   get isLoaded () {
      return this.$loaded;
   }

   /**
    * Set avatars
    * @param {string[]}
    */
   set avatars (avatars) {
      return this.$avatars = avatars;
   }

   /**
    * Fetch avatar list
    * @async 
    * @returns {Promise<string[]>}
    */
   async fetch () {
      const response = await fetch (this.sourceFileUrl, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json'
         }
      });

      return await response.json();
   }

   /**
    * Init avatar service
    */
   async init () {
      this.emit('onloadstart');

      try {
         this.avatars = await this.fetch();
         this.$loaded = true;
      }
      catch (err) {
         return this.emit('onloaderror', err);
      }
      this.emit('onloaded');
   }
}

class AvatarViewService extends AppEventService {

   /**
    * @constructor
    * @param {string[]} [avatarNameList] - Avatar name list
    */
   constructor (avatarNameList = []) {
      super();

      this.$avatarsList = avatarNameList;

      // Render all avatars
      this.renderAvatars(this.$avatarsList);
   }

   /**
    * Parent element of avatar list
    * @returns {Element}
    */
   get rootElement () {
      return document.getElementById('avatar-grid');
   }

   /**
    * Avatar source URL
    * @returns {string}
    */
   get sourceUrl () {
      return `${window.location.href}svg`;
   }

   /**
    * Avatar sourc file extension
    * @returns {string}
    */
   get sourceFileExtension () {
      return 'svg';
   }

   /**
    * Generate avatar source file url
    * @param {string} avatarName - Avatar name
    * @returns {string}
    */
   genSourceFileUrl (avatarName) {
      const sourceUrl = `${this.sourceUrl}/${avatarName}.${this.sourceFileExtension}`;
      
      return sourceUrl;
   }
   
   /**
    * Get avatar list
    * @returns {string[]}
    */
   get avatarList () {
      return this.$avatarsList;
   }

   /**
    * Fetch avatar source code
    * @async
    * @returns {Promise<string>}
    */
   async fetch (url) {
      const response = await fetch (url, {
         method: 'GET',
         headers: {
            'Accept': 'image/svg+xml'
         }
      });

      return await response.text();
   }

   createInstance (name) {
      const url = this.genSourceFileUrl(name);

      const avatar = document.createElement('a');
      avatar.href = url;
      avatar.target = '_blank';
      avatar.classList.add('avatar');

      const img = new Image();
      img.src = url;
      img.alt = name;

      const label = document.createElement('div');
      label.classList.add('label');
      label.textContent = name;

      avatar.append(img, label);

      this.rootElement.appendChild(avatar);

      return avatar;
   }

   renderAvatars (avatarList = []) {
      // Remove all childs
      const root = this.rootElement;
      while (root.firstChild) {
         root.removeChild(root.lastChild);
      }
      
      avatarList.forEach(avatar => {
         this.createInstance(avatar);
      });
   }
}

class App extends EventTarget {
   constructor () {
      super();

      const avatar = new AvatarService();
      
      avatar.addEventListener('onloaded', function (event) {
         const avatars = event.detail.avatars;

         const view = new AvatarViewService(avatars);

         document.getElementById('search-input').onkeyup = (event) => {
            const value = (event.target.value || '').toLowerCase();
            const results = avatars.filter(avatar => avatar.includes(value));

            view.renderAvatars(results);
         }
      });
      
      avatar.init();
   }
}

window.onload = function () {
   new App();
}
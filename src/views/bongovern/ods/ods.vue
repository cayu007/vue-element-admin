<template>
    <div class="app-container">
      <LoginForm v-if="!isAuthenticated" @login="handleLogin" />
  
      <div v-if="isAuthenticated">
        <button @click="handleLogout">Cerrar Sesión</button>
        <div class="filter-container">
        <el-input v-model="listQuery.titulo_datasets" placeholder="Título" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
       
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          Search
        </el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          Add
        </el-button>
        <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
          Export
        </el-button>
        <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
          reviewer
        </el-checkbox>
      </div>
        <el-table
        v-loading="listLoading"
        :key="tableKey"
  
          :data="posts"
          border
          fit
          highlight-current-row
        >
          <el-table-column label="ID" prop="id" align="center" width="80"></el-table-column>
          <el-table-column label="Date" width="150px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.date }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Title" min-width="150px">
            <template slot-scope="{row}">
              <span v-html="row.title.rendered"></span>
            </template>
          </el-table-column>
          <el-table-column label="Author" width="110px" align="center">
            <template slot-scope="{row}">
              <span>{{ row._embedded.author[0].name }}</span>
         
            </template>
          </el-table-column>
          <!-- Columna de acciones (Editar y Eliminar) -->
          <el-table-column label="Actions" width="200px" align="center">
                <template slot-scope="{row}">
                  <el-button size="mini" @click="handleEdit(row)">Edit</el-button>
                  <el-button size="mini" type="danger" @click="handleDelete(row)">Delete</el-button>
                </template>
              </el-table-column>
  
  
        </el-table>
        <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[5, 10, 20, 50]"
      :total="totalPosts">
  </el-pagination>
  
  
  <!-- Modal de edición -->
  
  <el-dialog title="Edit Post" :visible.sync="isEditModalOpen" width="70%">
    <el-table :data="editFields" style="width: 100%">
      <el-table-column prop="field" label="Field"></el-table-column>
      <el-table-column prop="value" label="Value">
        <template slot-scope="{row}">
          <div v-if="row.field === 'Title'">
            <el-input v-if="isEditingTitle" v-model="editableTitle"></el-input>
            <span v-else>{{ editingPost.acf.titulo_datasets }}</span>
            <el-button v-if="isEditingTitle" size="mini" @click="saveTitleEdit">Guardar</el-button>
            <el-button v-if="isEditingTitle" size="mini" @click="cancelTitleEdit">Cancelar</el-button>
          </div>
          <div v-if="row.field === 'Description'">
            <el-input v-if="isEditingDescription" type="textarea" v-model="editableDescription" :autosize="{ minRows: 2, maxRows: 4 }"></el-input>
            <span v-else>{{ editingPost.acf.descripcio_datasets }}</span>
            <el-button v-if="isEditingDescription" size="mini" @click="saveDescriptionEdit">Guardar</el-button>
            <el-button v-if="isEditingDescription" size="mini" @click="cancelDescriptionEdit">Cancelar</el-button>
          </div>
          <div v-if="row.field === 'Author'">
              <el-select v-if="isEditingAuthor" v-model="editableAuthor" placeholder="Select an author">
                  <el-option v-for="author in authors" :key="author.id" :label="author.name" :value="author.name"></el-option>
              </el-select>
              <span v-else>{{ getAuthorNameById(row.value) }}</span>
              <el-button v-if="isEditingAuthor" size="mini" @click="saveAuthorEdit">Guardar</el-button>
              <el-button v-if="isEditingAuthor" size="mini" @click="cancelAuthorEdit">Cancelar</el-button>
          </div>
  
          <div v-else-if="row.field !== 'Title' && row.field !== 'Description'">
            {{ row.value }}
          </div>
          
          <div v-if="row.field === 'Image'">
          <img :src="row.value" alt="Dataset Image" width="100">
          <el-upload
            action="https://governobert.staperpetua.cat/wp-json/wp/v2/media"
              :on-success="handleImageUploadSuccess"
              :on-error="handleImageUploadError">
              <el-button size="small" type="primary">Change image</el-button>
          </el-upload>
      </div> 
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="120">
        <template slot-scope="{row}">
          <el-button size="mini" @click="editField(row.field)">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="isEditModalOpen = false">Cancel</el-button>
      <el-button type="primary" @click="saveEditedPost">Save</el-button>
    </span>
  </el-dialog>
  
      </div>
    </div>
  </template>
  
  <script>
  import { authenticateWithWordPress, fetchPosts, updatePost, fetchAuthors, fetchACFUsers } from "@/api/wordpress";
  import LoginForm from "@/components/authentication/LoginForm.vue";
  //import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import waves from '@/directive/waves' // waves directive
  
  export default {
    name: "ComplexTable",
    components: { LoginForm },
    directives: { waves },
    data() {
      return {
      tableKey: 0,  
      id: null,  // o cualquier valor inicial  
      jwtToken: null,
      isAuthenticated: false,
      postType: 'datasetsdata', // Mantén solo una definición de 'postType'
      listQuery: {
          titulo_datasets: '',
          importance: '',
          type: '',
          sort: ''
                },
      posts: [],
      totalPosts: 0,
      currentPage: 1,
      pageSize: 10,
      authors: [],
      listLoading: false,
      isEditingDescription: false,
      editableDescription: '',
      isEditModalOpen: false,
      editingPost: null,
      isEditingTitle: false,
      editableTitle: '',
      isEditingAuthor: false,
      editableAuthor: '',
      editFields: [],
      showReviewer: false,
      downloadLoading: false
    };
  },
    created() {
   
    },
  
    /*
    async mounted() {
      // Verificar si hay un token
      const token = localStorage.getItem("jwtToken");
      console.log("Token retrieved from localStorage:", token);
  
      if (token) {
          this.jwtToken = token;
          this.isAuthenticated = true;
      }
  
      // Intentar obtener los posts y autores
      try {
          await this.fetchAndSetPosts();
          this.authors = await fetchAuthors();
          console.log(this.authors);
      } catch (error) {
          console.error("Error fetching posts:", error);
      }
  },*/
  async mounted() {
      // Verificar si hay un token
      const token = localStorage.getItem("jwtToken");
      console.log("Token retrieved from localStorage:", token);
  
      if (token && token.trim() !== "") {  // Asegurarse de que el token no esté vacío
          this.jwtToken = token;
          this.isAuthenticated = true;
      }
  
      try {
          this.listLoading = true;  // Activa el estado de carga
          const [postsResponse, authors] = await Promise.all([this.fetchAndSetPosts(), fetchAuthors()]);
          this.authors = authors;
          console.log(this.authors);
      } catch (error) {
          console.error("Error fetching data:", error);
      } finally {
          this.listLoading = false;  // Desactiva el estado de carga en cualquier caso
      }
  },
  
  
  
    methods: {
      
      // async fetchPosts(query = {}, postType = 'datasetsdata', page = 1, per_page = 10) {
      
        async fetchPosts(query = {}, postType = 'datasetsdata', page = 1, per_page = 10, acfFilterValue = '', acfDropdownValue = '') {
          this.listLoading = true;
  
          const queryParams = {
          'postType': postType,
          'page': page,
          'per_page': per_page,
          'filter[meta_key]': 'titulo_datasets',
          'filter[meta_value]': query.titulo_datasets,
          // ... otros parámetros basados en tus filtros ...
          };
          
          try {
              const response = await fetchPosts(postType, page, per_page);
              this.posts = response.data;
              this.totalPosts = response.total;
              this.listLoading = false;
          } catch (error) {
              this.listLoading = false;
              console.error("Error fetching posts:", error);
          }
      },
     
        async handleSizeChange(newSize) {
          this.pageSize = newSize;
      this.currentPage = 1;  // Resetear la página actual a 1
      await this.fetchAndSetPosts();
    },
  
    async handleCurrentChange(newPage) {
      this.currentPage = newPage;
      await this.fetchAndSetPosts();
    },
    /*
    async handleFilter() {
          await this.fetchPosts(this.listQuery);
      },*/
      async handleFilter() {
        console.log("Post type:", this.postType);
      await this.fetchPosts(this.postType, this.currentPage, this.pageSize, this.listQuery.titulo_datasets);
  },
  
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },  
  
  
  async fetchAndSetPosts() {
     // const response = await fetchPosts(this.postType, this.currentPage, this.pageSize);
     console.log("Value of this.postType before calling fetchPosts:", this.postType);
     const response = await fetchPosts(this.postType, this.currentPage, this.pageSize, this.listQuery.titulo_datasets);
      // Inserta la declaración de console.log aquí
      console.log("Response data:", response.data);
  
      this.posts = response.data;
      this.totalPosts = response.total;
  },
  
  
      async handleLogin(token) {
        this.jwtToken = token;
        this.isAuthenticated = true;
        localStorage.setItem("jwtToken", token);
        console.log("Token set in localStorage:", token);
        await this.fetchPosts();
      },
      async saveTitleEdit() {
          this.isEditingTitle = false;
  
          // Simplemente crea un objeto con el campo que deseas actualizar
          const updatedData = {
              titulo_datasets: this.editableTitle
          };
  
          try {
              // Pasa solo el postId y updatedData a updatePost
              const updatedPost = await updatePost(this.editingPost.id, updatedData);
              console.log("Post actualizado:", updatedPost);
  
              // Actualizar el post en el array local 'posts'
              const index = this.posts.findIndex(post => post.id === this.editingPost.id);
              if (index !== -1) {
                  // Actualiza el título en la lista local de posts.
                  this.$set(this.posts, index, { ...this.posts[index], acf: { ...this.posts[index].acf, titulo_datasets: this.editableTitle } });
              }
  
          } catch (error) {
              console.error("Hubo un error al actualizar el post:", error);
          }
      },
  
      async saveDescriptionEdit() {
          this.isEditingDescription = false;
  
          const updatedData = {
              content: this.editableDescription
          };
  
          try {
              const updatedPost = await updatePost(this.editingPost.id, updatedData, this.jwtToken);
              console.log("Post actualizado:", updatedPost);
  
              // Actualizar el post en el array local 'posts'
              const index = this.posts.findIndex(post => post.id === this.editingPost.id);
              if (index !== -1) {
                // this.posts[index] = { ...this.posts[index], content: { rendered: this.editableDescription } };
                this.$set(this.posts, index, { ...this.posts[index], content: { rendered: this.editableDescription } });
  
              }
  
          } catch (error) {
              console.error("Hubo un error al actualizar el post:", error);
          }
      },
  
  
      cancelDescriptionEdit() {
          this.isEditingDescription = false;
      },
      
       handleEdit(post) {
        this.editingPost = post;
        this.editableTitle = post.acf.titulo_datasets; // Añadir esta línea
        this.editableDescription = post.acf.descripcio_datasets; // Añade esta línea
  
        // Encuentra el nombre del autor usando el ID
        const authorName = this.authors.find(author => author.id === post.acf.regidor_responsable)?.name || post.acf.regidor_responsable;
  
        this.editFields = [
          { field: 'Title', value: post.acf.titulo_datasets },
          { field: 'Date', value: post.date },
          //{ field: 'Description', value: post.content.rendered },
          { field: 'Description', value: post.acf.descripcio_datasets },
          //{ field: 'Author', value: post.acf.regidor_responsable[0] },
          //{ field: 'Author', value: authorName },
          { field: 'Author', value: post.author },  // Asegúrate de que esto es el ID del autor
          { field: 'Image', value: post.acf.imagen_dataset }
  
  
          //{ field: 'Author', value: post._embedded.author[0].name } // Añadido
        ];
        this.isEditModalOpen = true;
      },
      editField(field) {
      if (field === 'Description') {
          this.isEditingDescription = true;
      } else if (field === 'Title') {
          this.isEditingTitle = true;
      } else if (field === 'Author') {
          this.isEditingAuthor = true;
          this.editableAuthor = this.editingPost.acf.regidor_responsable[0]; // asumiendo que regidor_responsable es un array
      }
      console.log("Edit field:", field);
  },
  
      cancelTitleEdit() {
      this.isEditingTitle = false;
    },
    getAuthorNameById(authorId) {
      const author = this.authors.find(a => a.id === authorId);
      return author ? author.name : 'Unknown Author';
  },
  
  
    saveTitleEdit() {
      // Aquí puedes agregar la lógica para guardar los cambios en el campo "Title"
      // Por ahora, simplemente cerraremos el modo de edición:
      this.isEditingTitle = false;
    },
      saveEditedPost() {
        console.log("Save edited post:", this.editingPost.id, "with content:", this.editingContent);
        // Aquí puedes llamar a tu API para guardar los cambios.
        // Por ahora, solo cerraremos el modal:
        this.isEditModalOpen = false;
      },
      saveAuthorEdit() {
          // Aquí, puedes agregar la lógica para guardar los cambios en el campo "Author".
          // Por ahora, simplemente cerraremos el modo de edición y actualizaremos el valor en 'editFields'.
          const index = this.editFields.findIndex(field => field.field === 'Author');
          if (index !== -1) {
              this.editFields[index].value = this.editableAuthor;
          }
          this.isEditingAuthor = false;
      },
  
      cancelAuthorEdit() {
          this.isEditingAuthor = false;
      },
  
      handleImageUploadSuccess(response, file) {
          // Aquí puedes manejar la respuesta después de una carga exitosa.
          // Por ejemplo, si tu backend devuelve la URL de la imagen cargada, puedes actualizar el valor en 'editFields'.
          const index = this.editFields.findIndex(field => field.field === 'Image');
          if (index !== -1) {
              this.editFields[index].value = response.imageUrl; // Asumiendo que 'imageUrl' es la clave en la respuesta que contiene la URL de la imagen.
          }
      },
  
      handleImageUploadError(err, file, fileList) {
          console.error("Error uploading the image:", err);
      },
  
      handleLogout() {
      // Elimina el token de la sesión
      localStorage.removeItem("jwtToken");
      console.log("Token removed from localStorage");
      this.jwtToken = null;
      this.isAuthenticated = false;
      },
  
      handleDelete(row) {
        // Aquí debes implementar la lógica para eliminar una entrada
        // Por ahora, solo imprimirá un mensaje en la consola.
        console.log("Eliminar entrada:", row.id);
        // Posteriormente, debes llamar a tu API para eliminar la entrada.
      
  
      },
      handleDownload() {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
          const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'table-list'
          })
          this.downloadLoading = false
        })
      },
      formatJson(filterVal) {
        return this.list.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      },
      getSortClass: function(key) {
        const sort = this.listQuery.sort
        return sort === `+${key}` ? 'ascending' : 'descending'
      }
    }
  };
  </script>
  <style scoped>
  /* Si tienes algún estilo específico para este componente, colócalo aquí. */
  </style>
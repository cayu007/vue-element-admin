<template>
    <div class="app-container">
      <LoginForm v-if="!isAuthenticated" @login="handleLogin" />
  
      <div v-if="isAuthenticated">
        <button @click="handleLogout">Cerrar Sesión</button>
        <div class="filter-container">
            <el-input v-model="regidorResponsableQuery" placeholder="Regidor Responsable" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
       
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
        :data="authors" 
        border
        fit
        highlight-current-row
    >
        <el-table-column label="Author Name" min-width="110px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span> <!-- Suponiendo que 'name' es una propiedad de los autores -->
          </template>
        </el-table-column>

        <!-- Puedes agregar más columnas para mostrar más detalles de los autores -->

        <!-- Columna de acciones (Editar, Resetear Contraseña y Eliminar) -->
        <el-table-column label="Actions" width="200px" align="center">
          <template slot-scope="{row}">
            <el-button size="mini" @click="resetPassword(row.id)">Reset Password</el-button>
            <el-button size="mini" @click="editAuthor(row.id)">Editar</el-button>
            <el-button size="mini" type="danger" @click="deleteAuthor(row.id)">Borrar</el-button>
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
    :total="totalAuthors">
</el-pagination>
  
  <!-- Modal de edición -->
  
  <el-dialog title="Edit Post" :visible.sync="isEditModalOpen" width="70%">
    <el-table :data="editFields" style="width: 100%">
      <el-table-column prop="field" label="Field"></el-table-column>
      <el-table-column prop="value" label="Value">
        <template slot-scope="{row}">

          <div v-if="row.field === 'Author'">
            <el-input v-if="isEditingAuthor" v-model="editableAuthor" placeholder="Edit author name"></el-input>
            <span v-else>{{ row.value }}</span>
            <el-button v-if="isEditingAuthor" size="mini" @click="() => saveFieldEdit('Author', editableAuthor)">Guardar</el-button>
            <el-button v-if="isEditingAuthor" size="mini" @click="cancelAuthorEdit">Cancelar</el-button>
        </div>

  
          <div v-else-if="row.field !== 'Title' && row.field !== 'Author'">
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
    jwtToken: null,
    isAuthenticated: false,
    authors: [],
    listLoading: false,
    showReviewer: false,
    totalAuthors: 0, // Total de autores (sustituyendo totalPosts)
    currentPage: 1,
    pageSize: 10,
    downloadLoading: false,
    isEditModalOpen: false,
    editingAuthor: null, // Almacenará el autor que se está editando
    regidorResponsableQuery: '', // para almacenar la entrada del usuario
    editFields: [],
    isEditingAuthor: false,
   
    
  };
},


  async mounted() {
    // Verificar si hay un token
    const token = sessionStorage.getItem("jwtToken");
    console.log("Token retrieved from sessionStorage:", token);

    if (token && token.trim() !== "") {  // Asegurarse de que el token no esté vacío
        this.jwtToken = token;
        this.isAuthenticated = true;
    }

    try {
        this.listLoading = true;  // Activa el estado de carga
        const authors = await fetchAuthors();  // Obtiene solamente los autores
        this.authors = authors;
        console.log(this.authors);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        this.listLoading = false;  // Desactiva el estado de carga en cualquier caso
    }
},

  
  
  
methods: {
  // Obtener autores
  async fetchAuthors() {
    try {
      this.listLoading = true;
      const authors = await fetchAuthors(); // Asumimos que esta función está definida en "@/api/wordpress"
      this.authors = authors;
      this.totalAuthors = authors.length;
    } catch (error) {
      console.error("Error fetching authors:", error);
    } finally {
      this.listLoading = false;
    }
  },

  // Autenticación
  async handleLogin(token) {
    this.jwtToken = token;
    this.isAuthenticated = true;
    sessionStorage.setItem("jwtToken", token);
    console.log("Token set in sessionStorage:", token);
    await this.fetchAuthors();
  },

  handleLogout() {
    // Eliminar el token de la sesión
    sessionStorage.removeItem("jwtToken");
    console.log("Token removed from sessionStorage");
    this.jwtToken = null;
    this.isAuthenticated = false;
  },
  handleCreate() {
    this.resetTemp();
    this.dialogStatus = 'create';
    this.dialogFormVisible = true;
    this.$nextTick(() => {
      this.$refs['dataForm'].clearValidate();
    });
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
    },

  async handleFilter() {
    await this.fetchAuthors(this.currentPage, this.pageSize);
  },

  // Acciones relacionadas con autores
  resetPassword(authorId) {
    // Implementa la lógica para reestablecer la contraseña aquí
    console.log(`Reestableciendo contraseña para el autor con ID ${authorId}`);
  },

  editAuthor(authorId) {
    // Encuentra el autor usando el ID
    const author = this.authors.find(a => a.id === authorId);
    if (author) {
        this.editingAuthor = author; // Asumiendo que tienes una propiedad 'editingAuthor' en tu data

        // Establece los campos para editar
        this.editFields = [
            { field: 'Author', value: author.name }
            // Puedes añadir más campos aquí si lo necesitas
        ];
        
        // Abre el modal
        this.isEditModalOpen = true;
    } else {
        console.error(`No se encontró el autor con ID ${authorId}`);
    }
},


  deleteAuthor(authorId) {
    // Implementa la lógica para eliminar el autor aquí
    console.log(`Eliminando autor con ID ${authorId}`);
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
    getWordPressAuthorNameById(authorId) {
        const author = this.authors.find(a => a.id === authorId);
        return author ? author.name : 'Unknown Author';
    },
    handleEdit(post) {
      this.editingPost = post;
      

      // Encuentra el nombre del autor usando el ID
      const authorName = this.authors.find(author => author.id === post.acf.regidor_responsable)?.name || post.acf.regidor_responsable;

      this.editFields = [

        { field: 'Author', value: post.acf.regidor_responsable },  // Asegúrate de que esto es el ID del autor

      ];
      this.isEditModalOpen = true;
    },
    editField(field) {

     if (field === 'Author') {
        this.isEditingAuthor = true;
        this.editableAuthor = this.editingPost.acf.regidor_responsable[0]; // asumiendo que regidor_responsable es un array
    }  
    },
    saveAuthorEdit() {
        this.saveFieldEdit('Author', this.isEditingAuthor);
    },
    cancelAuthorEdit() {
        this.isEditingAuthor = false;
    },
    
}

  };
  </script>
  <style scoped>
  /* Si tienes algún estilo específico para este componente, colócalo aquí. */
  </style>
<template>
  <div class="app-container">
    <LoginForm v-if="!isAuthenticated" @login="handleLogin" />

    <div v-if="isAuthenticated">
      <button @click="handleLogout">Cerrar Sesión</button>
      <div class="filter-container">
        <el-input
          v-model="listQuery.titulo_datasets"
          placeholder="Título"
          style="width: 200px"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >
          Search
        </el-button>
        <el-button
          class="filter-item"
          style="margin-left: 10px"
          type="primary"
          icon="el-icon-edit"
          @click="handleCreate"
        >
          Add
        </el-button>
        <el-button
          v-waves
          :loading="downloadLoading"
          class="filter-item"
          type="primary"
          icon="el-icon-download"
          @click="handleDownload"
        >
          Export
        </el-button>
        <el-checkbox
          v-model="showReviewer"
          class="filter-item"
          style="margin-left: 15px"
          @change="tableKey=tableKey+1"
        >
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
        <el-table-column
          label="ID"
          prop="id"
          align="center"
          width="80"
        ></el-table-column>
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
            <span>{{ getWordPressAuthorNameById(row.author) }}</span>
          </template>
        </el-table-column>
        <!-- Columna de acciones (Editar y Eliminar) -->
        <el-table-column label="Actions" width="200px" align="center">
          <template slot-scope="{row}">
            <el-button size="mini" @click="handleEdit(row)">Edit</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(row)"
              >Delete</el-button
            >
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
        :total="totalPosts"
      >
      </el-pagination>

      <!-- Modal de edición -->

      <el-dialog title="Edit Post" :visible.sync="isEditModalOpen" width="70%">
        <el-table :data="editFields" style="width: 100%">
          <el-table-column prop="field" label="Field"></el-table-column>
          <el-table-column prop="value" label="Value">
            <template slot-scope="{row}">
              <div v-if="row.field === 'Title'">
                <el-input
                  v-if="isEditingTitle"
                  v-model="editableTitle"
                ></el-input>
                <span v-else>{{ editingPost.acf.titulo_datasets }}</span>
                <el-button
                  v-if="isEditingTitle"
                  size="mini"
                  @click="() => saveFieldEdit('Title', editableTitle)"
                  >Guardar</el-button
                >
                <el-button
                  v-if="isEditingTitle"
                  size="mini"
                  @click="cancelTitleEdit"
                  >Cancelar</el-button
                >
              </div>

              <div v-if="row.field === 'Description'">
                <el-input
                  v-if="isEditingDescription"
                  type="textarea"
                  v-model="editableDescription"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                >
                </el-input>
                <span v-else>{{ editingPost.acf.descripcio_datasets }}</span>
                <el-button
                  v-if="isEditingDescription"
                  size="mini"
                  @click="() => saveFieldEdit('Description', editableDescription)"
                  >Guardar</el-button
                >
                <el-button
                  v-if="isEditingDescription"
                  size="mini"
                  @click="cancelDescriptionEdit"
                  >Cancelar</el-button
                >
              </div>

              <div v-if="row.field === 'Author'">
                <el-select
                  v-if="isEditingAuthor"
                  v-model="editableAuthor"
                  placeholder="Select an author"
                >
                  <el-option
                    v-for="author in authors"
                    :key="author.id"
                    :label="author.name"
                    :value="author.id"
                  ></el-option>
                </el-select>
                <span v-else>{{ getWordPressAuthorNameById(row.value) }}</span>
                <el-button
                  v-if="isEditingAuthor"
                  size="mini"
                  @click="() => saveFieldEdit('Author', editableAuthor)"
                  >Guardar</el-button
                >
                <el-button
                  v-if="isEditingAuthor"
                  size="mini"
                  @click="cancelAuthorEdit"
                  >Cancelar</el-button
                >
              </div>

              <div v-else-if="!isSpecialField(row.field)">
                  {{ row.value }}
              </div>

              <div v-if="row.field === 'Image'">
                <!-- Muestra la imagen actual -->
                <img :src="row.value.url" alt="Dataset Image" width="100" />

                <!-- Sube una nueva imagen -->
                <el-upload
                  action="https://governobert.staperpetua.cat/wp-json/wp/v2/media"
                  :on-success="handleImageUploadSuccess"
                  :on-error="handleImageUploadError"
                >
                  <el-button size="small" type="primary"
                    >Change image</el-button
                  >
                </el-upload>
              </div>
              <div v-if="row.field === 'Tema Rcomptes'">
                <el-select
                  v-if="isEditingTemaRcomptes"
                  v-model="editableTemaRcomptes"
                  placeholder="Seleccionar Tema"
                >
                  <el-option
                    v-for="tema in temas"
                    :key="tema.id"
                    :label="tema.name"
                    :value="tema.id"
                  ></el-option>
                </el-select>
               <span v-else>{{ Array.isArray(editingPost.acf.tema_rcomptes) ? editingPost.acf.tema_rcomptes[0] : editingPost.acf.tema_rcomptes }}</span>



                <el-button
                  v-if="isEditingTemaRcomptes"
                  size="mini"
                  @click="() => saveFieldEdit('Tema Rcomptes', editableTemaRcomptes)"
                  >Guardar</el-button
                >
                <el-button
                  v-if="isEditingTemaRcomptes"
                  size="mini"
                  @click="cancelTemaRcomptesEdit"
                  >Cancelar</el-button
                >
              </div>

              <div v-if="row.field === 'CategoriaDatasets'">
                <el-select
                  v-if="isEditingCategoriaDatasets"
                  v-model="editableCategoriaDatasets"
                  placeholder="Select a topic"
                >
                  <el-option
                    v-for="categoriadat in categoriadats"
                    :key="categoriadat.id"
                    :label="categoriadat.name"
                    :value="categoriadat.id"
                  ></el-option>
                </el-select>
                <span v-else>{{ Array.isArray(editingPost.acf.categoria_rcomptes) ? editingPost.acf.categoria_rcomptes[0] : editingPost.acf.categoria_rcomptes }}</span>

                  
                <el-button
                  v-if="isEditingCategoriaDatasets"
                  size="mini"
                  @click="() => saveFieldEdit('CategoriaDatasets', editableCategoriaDatasets)"
                  >Guardar</el-button
                >
                <el-button
                  v-if="isEditingCategoriaDatasets"
                  size="mini"
                  @click="cancelCategoriaDatasetsEdit"
                  >Cancelar</el-button
                >
              </div>
              <div v-if="row.field === 'Agregado AI Engine'">
                <el-select
                    v-if="isEditingAIEngine"
                    v-model="editableAIEngine"
                    placeholder="Select an AI Engine"
                >
                    <el-option
                        v-for="engine in aiEngines"
                        :key="engine.id"
                        :label="engine.name"
                        :value="engine.id"
                    ></el-option>
                </el-select>
              
                <span v-else>{{ editingPost.acf.agregado_ai_engine }}</span>
                <el-button
                    v-if="isEditingAIEngine"
                    size="mini"
                    @click="() => saveFieldEdit('Agregado AI Engine', editableAIEngine)"
                >Guardar</el-button>
                <el-button
                    v-if="isEditingAIEngine"
                    size="mini"
                    @click="cancelAIEngineEdit"
                >Cancelar</el-button>
            </div>
            <!-- Vista de "Categoria Ods" en el modo de visualización -->
            <div v-if="row.field === 'Categoria Ods'">
                <ul>
                    <li v-for="id in editingPost.acf.categoria_ods" :key="id">
                        {{ getCategoryNameById(id) }}
                    </li>
                </ul>
            </div>
            <div v-if="row.field === 'Font'">
                <el-input
                  v-if="isEditingFont"
                  type="textarea"
                  v-model="editableFont"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                >
                </el-input>
                <span v-else>{{ editingPost.acf.font_datasets }}</span>
                <el-button
                  v-if="isEditingFont"
                  size="mini"
                  @click="() => saveFieldEdit('Font', editableFont)"
                  >Guardar</el-button
                >
                <el-button
                  v-if="isEditingFont"
                  size="mini"
                  @click="cancelFontEdit"
                  >Cancelar</el-button
                >
              </div>

            </template>
          </el-table-column>
          <el-table-column label="Actions" width="120">
            <template slot-scope="{row}">
              <el-button size="mini" @click="editField(row.field)" v-if="row.field !== 'Categoria Ods'">Edit</el-button>
              <el-button size="mini" @click="openCategoriaOdsModal" v-if="row.field === 'Categoria Ods'">Edit</el-button>
              
           </template>
          </el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button @click="isEditModalOpen = false">Cancel</el-button>
          <el-button type="primary" @click="saveEditedPost">Save</el-button>
        </span>
      </el-dialog>
      <!-- Modal de edición "Categoria Ods" -->
      <el-dialog :visible.sync="isCategoriaOdsModalOpen" @close="closeModal" width="60%">
        <!-- Contenedor principal -->
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between;">

          <div v-for="categoria in categoriasOds" :key="categoria.id" style="flex: 0 0 calc(33.333% - 1rem); text-align: center; box-sizing: border-box; padding: 10px;">


                <!-- Envoltura para imagen y checkbox -->
                <label style="display: block; cursor: pointer;" @click="toggleCheckbox(categoria.id)">


                    <!-- Envoltura para imagen -->
                    <div style="margin-bottom: 10px;">
                        <img :src="categoria.image" :alt="categoria.name" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
                    </div>

                    <!-- Envoltura para checkbox -->
                    <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
                      <el-checkbox v-model="selectedCategorias" :label="categoria.id" @change="toggleCheckbox(categoria.id)">{{ categoria.name }}</el-checkbox>


                    </div>
                </label>

            </div>

        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="isCategoriaOdsModalOpen = false">Cancelar</el-button>
            <el-button type="primary" @click="saveSelectedCategorias">Guardar</el-button>
        </span>
    </el-dialog>





    </div>
  </div>
</template>

<script>
import { authenticateWithWordPress, fetchPosts, updatePost, fetchAuthors, fetchACFAuthors } from "@/api/wordpress";
import LoginForm from "@/components/authentication/LoginForm.vue";
//import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import waves from '@/directive/waves' // waves directive





export default {
  name: "ComplexTable",
  components: {
        LoginForm,
             // Tu componente existente
       // CategoriaOdsModal   // Tu nuevo componente
    },
  directives: { waves },
 /* watch: {
    'editingPost.acf.categoria_ods': {
      deep: true,
      handler(value) {
        console.log(value);
      }
    }
  },*/
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
    // temaRcomptesOptions: [],
    listLoading: false,
    editableImage: null,
    isEditingDescription: false,
    editableCategoriaDatasets: '',
    editableDescription: '',
    isEditModalOpen: false,
    editingPost: null,
    isEditingTemaRcomptes: false,
    isEditingTitle: false,
    editableTemaRcomptes: '',
    editableTitle: '',
    isEditingAuthor: false,
    editableAuthor: '',
    isEditingCategoriaDatasets: false,
      //categoriaRcomptesOptions: [],
    //categoriaDatasetsOptions: [],
    editFields: [],
    isEditingAIEngine: false,
    aiEngines: [
            { id: 'SI', name: 'SI' },
            { id: 'NO', name: 'NO' }
        ],
    temas: [
            { id: 'Serveis públics', name: 'Serveis públics' },
            { id: 'Qualitat de vida', name: 'Qualitat de vida' },
            { id: 'Informació institucional', name: 'Informació institucional' },
            { id: 'Informació econòmica', name: 'Informació econòmica' }
        ],
    categoriadats: [
            { id: 'Contractació i Compres', name: 'Contractació i Compres' },
            { id: 'Organització i Recursos Humans', name: 'Organització i Recursos Humans' },
            { id: 'Govern Obert i Transparència', name: 'Govern Obert i Transparència' },
            { id: 'Hisenda i Tributs', name: 'Hisenda i Tributs' },
            { id: 'Urbanisme i Habitatge', name: 'Urbanisme i Habitatge' },
            { id: 'Empresa i Comerç', name: 'Empresa i Comerç' },
            { id: 'Formació i Ocupació', name: 'Formació i Ocupació' },
            { id: 'Canvi Climàtic - Transició Energètica i Medi Ambient', name: 'Canvi Climàtic - Transició Energètica i Medi Ambient' },
            { id: 'Mobilitat i Via Pública', name: 'Mobilitat i Via Pública' },
            { id: 'Serveis a la Ciutadania', name: 'Serveis a la Ciutadania' },
            { id: 'Seguretat Ciutadana', name: 'Seguretat Ciutadana' },
            { id: 'Cultura i Lleure', name: 'Cultura i Lleure' },
            { id: 'Població', name: 'Població' },
            { id: 'Comunicació', name: 'Comunicació' },
            { id: 'Salut Pública', name: 'Salut Pública' }
   ],        
    
    editableAIEngine: '',
    isEditingCategoriaOds: false,  // Inicialmente, no estás editando
        editableCategoriaOds: null,   // Valor temporal de edición, inicialmente nulo
        editingPost: {                // Post en edición
            // ...otros campos del post...
            acf: {
                categoria_ods: [],    // Array vacío por defecto
                // ...otros campos acf...
            }
        },
   isCategoriaOdsModalOpen: false,
   selectedCategorias: [],
   categoriasOds: [
      { id: 82, name: "Fi de la pobresa", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/1-Fi-de-la-pobresa.webp" },
      { id: 83, name: "Fam zero", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/2-fam-zero.webp" },
      { id: 84, name: "Salut i benestar", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/3-Salut-i-benestar.webp" },
      { id: 85, name: "Educació de qualitat", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/4-Educacio-de-qualitat.webp" },
      { id: 86, name: "Igualtat de gènere", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/5-Igualtat-de-genere.webp" },
      { id: 87, name: "Aigua neta i sanejament", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/6-Aigua-neta-i-sanejament.webp" },
      { id: 88, name: "Energia neta i assequible", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/7-Energia-neta-i-assequible.webp" },
      { id: 89, name: "Treball digne i creixement econòmic", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/8-treball-digne-i-creixement-economic.webp" },
      { id: 90, name: "Indùstria, innovació i infraestructures", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/9-industria-innovacio-i-infraestructures.webp" },
      { id: 91, name: "Reducció de les desigualtats", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/10-reduccio-de-les-desigualtats.webp" },
      { id: 92, name: "Ciutats i comunitats sostenibles", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/11-ciutats-i-comunitats-sostenibles.webp" },
      { id: 93, name: "Consum i producció responsables", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/12-comsum-i-produccio-responsable.webp" },
      { id: 94, name: "Acció climàtica", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/13-accio-climatica.webp" },
      { id: 95, name: "Vida submarina", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/14-vida-submarina.webp" },
      { id: 96, name: "Vida terrestre", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/15-vida-terrestre.webp" },
      { id: 97, name: "Pau, justícia i institucions sòlides", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/16-pau-justicia-i-institucions-solides.webp" },
      { id: 98, name: "Aliança pels objectius", image: "https://governobert.staperpetua.cat/wp-content/uploads/2022/11/17-alianca-pels-objectius.webp" }
          
    ],
    showReviewer: false,
    downloadLoading: false,
    isEditingFont: false,
    editableFont: ''

  };
},
  created() {

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

            // Recupera los posts, autores de WordPress y autores de ACF


            const [postsResponse, authors, categoriaDatasetsOptions] = await Promise.all([
                this.fetchAndSetPosts(),

                fetchAuthors(),
          


            ]);
        
            this.authors = authors;
          
  


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
  isSpecialField(fieldName) {
        const specialFields = [
            'Title', 'Description', 'Image', 'Tema Rcomptes',
            'CategoriaDatasets', 'Agregado AI Engine', 'Categoria Ods',
            'Font'
        ];
        return specialFields.includes(fieldName);
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
  toggleCheckbox(categoriaId) {
  if (this.selectedCategorias.includes(categoriaId)) {
    this.selectedCategorias = this.selectedCategorias.filter(id => id !== categoriaId);
  } else {
    this.selectedCategorias.push(categoriaId);
  }
},

  saveSelectedCategorias() {
   
      
   this.editingPost.acf.categoria_ods = [...this.selectedCategorias];

   this.saveFieldEdit('Categoria Ods', this.selectedCategorias);



    // Si tienes un método o API para guardar los cambios en el backend, llámalo aquí.
    // Por ejemplo: this.savePost(this.editingPost);
    // Aquí, implementa la lógica para guardar las categorías seleccionadas.
    this.isCategoriaOdsModalOpen = false;
    },
  openCategoriaOdsModal() {
      console.log('Abriendo modal de Categoria Ods');
      this.selectedCategorias = [...this.editingPost.acf.categoria_ods];
      this.isCategoriaOdsModalOpen = true;
  },

  closeModal() {
    this.isCategoriaOdsModalOpen = false;
  },
  cancelCategoriaOdsEdit() {
      // Aquí tu lógica para cancelar la edición de "Categoria ODS"
      this.isEditingCategoriaOds = false;
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
      sessionStorage.setItem("jwtToken", token);
      console.log("Token set in sessionStorage:", token);
      await this.fetchPosts();
    },

async saveFieldEdit(fieldName, fieldValue) {
        this.isEditingDescription = false;
        this.isEditingAIEngine = false;
        this.isEditingTemaRcomptes = false;
        this.isEditingCategoriaDatasets = false;
        this.isEditingCategoriaOds = false;
        this.isEditingFont = false;
    

        let updatedData = {};  // Definir updatedData aquí

        if (fieldName === 'Image') {
            updatedData.imagen_dataset = this.editableImage;
        } else {
            const fieldMap = {
                'Description': 'descripcio_datasets',
                'Title': 'titulo_datasets',
                'Author': 'regidor_responsable',
                'Tema Rcomptes': 'tema_rcomptes',
                'Agregado AI Engine': 'agregado_ai_engine',
                'CategoriaDatasets': 'categoria_rcomptes',
                'Categoria Ods': 'categoria_ods',
                'Font': 'font_datasets',

            };
            const apiFieldName = fieldMap[fieldName];
            if (!apiFieldName) {
                console.error("Nombre de campo no mapeado:", fieldName);
                return;
            }
            updatedData[apiFieldName] = fieldValue;
        }

        try {
            await updatePost(this.editingPost.id, updatedData);
          console.log("Post actualizado con", fieldName, ":", fieldValue);
          
            // Actualizar el post en el array local 'posts'
            const index = this.posts.findIndex(post => post.id === this.editingPost.id);
            if (index !== -1) {
               this.$set(this.posts, index, { ...this.posts[index], ...updatedData });
            }
                    // Actualizar el post en el array local 'posts'
 
        } catch (error) {
            console.error("Hubo un error al actualizar el post:", error);
        }
    },

    saveDescriptionEdit() {
       this.saveFieldEdit('Description', this.editableDescription);
    },
    cancelDescriptionEdit() {
        this.isEditingDescription = false;
    },
    saveTitleEdit() {
        this.saveFieldEdit('Title', this.isEditingTitle);
    },
    cancelTitleEdit() {
        this.isEditingTitle = false;
    },
    saveAuthorEdit() {
        this.saveFieldEdit('Author', this.isEditingAuthor);
    },
    cancelAuthorEdit() {
        this.isEditingAuthor = false;
    },
    saveAIEngineEdit() {
        this.saveFieldEdit('Agregado AI Engine', this.isEditingAIEngine);
    },
    cancelAIEngineEdit() {
        this.isEditingAIEngine = false;
    },
    saveTemaRcomptesEdit() {
        this.saveFieldEdit('Tema Rcomptes', this.isEditingTemaRcomptes);
    },
    cancelTemaRcomptesEdit() {
        this.isEditingTemaRcomptes = false;
    },

    saveCategoriaDatasetsEdit() {
      this.saveFieldEdit('CategoriaDatasets', this.isEditingCategoriaDatasets);
    },
    cancelCategoriaDatasetsEdit() {
      this.isEditingCategoriaDatasets = false;
    },
    saveFontEdit() {
        this.saveFieldEdit('Font', this.editableFont);
    },
    cancelFontEdit() {
        this.isEditingFont = false;
    },


    getWordPressAuthorNameById(authorId) {
        const author = this.authors.find(a => a.id === authorId);
        return author ? author.name : 'Unknown Author';
    },
/*
    closeCategoriaOdsModal() {
      this.isCategoriaODSModalOpen = false;
    },
    */
    /*
    getWordPressTemaNameById(optionId) {
        const option = this.temaRcomptesOptions.find(a => a.id === optionId);
        return option ? option.name : 'Unknown TEns';
    },
*/
     handleEdit(post) {
      this.editingPost = post;
      this.editableTitle = post.acf.titulo_datasets; // Añadir esta línea
      this.editableDescription = post.acf.descripcio_datasets; // Añade esta línea
      this.editableImage = post.acf.imagen_dataset;
      this.editableTemaRcomptes = post.acf.tema_rcomptes; // Asegúrate de que esta es la propiedad correcta
      this.editableCategoriaDatasets = post.acf.categoria_rcomptes;
      this.editableAIEngine = post.acf.agregado_ai_engine;
    // this.editableCategoriaOds = post.acf.categorias_ods;
      this.editableFont = post.acf.font_datasets; // Añade esta línea
      

      // Encuentra el nombre del autor usando el ID
      const authorName = this.authors.find(author => author.id === post.acf.regidor_responsable)?.name || post.acf.regidor_responsable;

      this.editFields = [
        { field: 'Title', value: post.acf.titulo_datasets },
        { field: 'Date', value: post.date },
        //{ field: 'Description', value: post.content.rendered },
        { field: 'Description', value: post.acf.descripcio_datasets },
        //{ field: 'Author', value: post.acf.regidor_responsable[0] },
        //{ field: 'Author', value: authorName },
        { field: 'Author', value: post.acf.regidor_responsable },  // Asegúrate de que esto es el ID del autor
        {field: 'Agregado AI Engine', value: post.acf.agregado_ai_engine },

        { field: 'Image', value: post.acf.imagen_dataset },
        { field: 'Tema Rcomptes', value: post.acf.tema_rcomptes },
        { field: 'CategoriaDatasets', value: post.acf.categoria_rcomptes },
        { field: 'Categoria Ods', value: post.acf.categoria_ods },
        { field: 'Font', value: post.acf.font_datasets }

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
    } else if (field === 'Agregado AI Engine') {
        this.isEditingAIEngine = true;
    //    this.editableAIEngine = this.editingPost.acf.agregado_ai_engine[0]; // asumiendo que regidor_responsable es un array    
    } else if (field === 'Tema Rcomptes') {
        this.isEditingTemaRcomptes = true;
       this.editableTemaRcomptes = this.editingPost.acf.tema_rcomptes[0];
    }
    else if (field === 'CategoriaDatasets') {
        this.isEditingCategoriaDatasets = true;
        this.editableCategoriaDatasets = this.editingPost.acf.categoria_rcomptes[0];
      }
      else if (field === 'Categoria Ods') {
        this.isEditingCategoriaOds = true;
        this.editableCategoriaOds = this.editingPost.acf.categoria_ods[0];
      }
      else if (field === 'Font') {
        this.isEditingFont = true;
      }    
    },
    

    cancelTitleEdit() {
    this.isEditingTitle = false;
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
    
    saveAIEngineEdit() {
        // Aquí, puedes agregar la lógica para guardar los cambios en el campo "Author".
        // Por ahora, simplemente cerraremos el modo de edición y actualizaremos el valor en 'editFields'.
        const index = this.editFields.findIndex(field => field.field === 'Agregado AI Engine');
        if (index !== -1) {
            this.editFields[index].value = this.editableAIEngine;
        }
        this.isEditingAIEngine = false;
    },
    getCategoryNameById(id) {
      const categoria = this.categoriasOds.find(cat => cat.id === id);
      return categoria ? categoria.name : 'Categoría no encontrada';
    },

    cancelAIEngineEdit() {
        this.isEditingAIEngine = false;
    },
    saveTemaRcomptesEdit() {
        // Aquí, puedes agregar la lógica para guardar los cambios en el campo "Author".
        // Por ahora, simplemente cerraremos el modo de edición y actualizaremos el valor en 'editFields'.
        const index = this.editFields.findIndex(field => field.field === 'Tema Rcomptes');
        if (index !== -1) {
            this.editFields[index].value = this.editableTemaRcomptes;
        }
        this.isEditingTemaRcomptes = false;
    },

    cancelTemaRcomptesEdit() {
        this.isEditingTemaRcomptes = false;
    },


    handleImageUploadSuccess(response, file) {
        // Aquí puedes manejar la respuesta después de una carga exitosa.
        // Por ejemplo, si tu backend devuelve la URL de la imagen cargada, puedes actualizar el valor en 'editFields'.
        this.editableImage = response.source_url;  // Asume que 'source_url' es la clave en la respuesta que contiene la URL de la imagen.
    },

    handleImageUploadError(err, file, fileList) {
        console.error("Error uploading the image:", err);
    },

    handleLogout() {
    // Elimina el token de la sesión
    sessionStorage.removeItem("jwtToken");
    console.log("Token removed from sessionStorage");
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
    },
    // Fetch possible values for "agregado_ai_engine" from the API

    
  }
};
</script>
<style scoped>
/* Si tienes algún estilo específico para este componente, colócalo aquí. */
</style>

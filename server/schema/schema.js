import { GraphQLObjectType, GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLList, GraphQLEnumType} from "graphql";
import { clients,projects } from "../sampleData.js";
import projectModel from "../models/project.js";
import clientModel from "../models/client.js";


// client schema
const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
  }),
});

//project schema
const ProjectType = new GraphQLObjectType({
  name: 'Project',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    client:{
      type:ClientType,
      resolve(parent,arg){
        // here parents refer to project above as client is used inside of project
        // return clients.find((client=>{return client.id===parent.id}));
         return clientModel.findById(parent.clientId);
      }
    }
  }),
});

// this all are like get apis 
//  /clients || /client{id} || /projects || /project{id}
const rootQuery=new GraphQLObjectType({
  name:"RootQueryType",
  fields:{
    //this will retrieve all clients
    clients:{
      type:new GraphQLList(ClientType),
      resolve(parent,args){
        // return clients;
        return clientModel.find();
      }
    },
    // this will retrieve any client with id
    client:{
      type:ClientType,
      args:{id:{type:GraphQLID}},
      resolve(parent,args){
        // return  clients.find(client=>{return client.id===args.id})
        return clientModel.findById(args.id)
      }
    },
    //this will retrieve all proejcts
    projects:{
      type:new GraphQLList(ProjectType),
      resolve(parent,args){
        // return projects;
        return projectModel.find();
      }
    },
    // this will retrieve any client with id
    project:{
      type:ProjectType,
      args:{id:{type:GraphQLID}},
      resolve(parent,args){
        // return  projects.find(project=>{return project.id===args.id})
        return projectModel.findById(args.id)
      }
    }
  }
})

const myMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Add a client
    addClient: {
      type: ClientType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }, //GraphQlNonNull ensures that value can't be blank
        email: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        const client = new clientModel({
          name: args.name,
          email: args.email,
          phone: args.phone,
        });

        return client.save();
      },
    },
    //delete a client
    deleteClient:{
      type:ClientType,
      args:{
        id:{type:GraphQLNonNull(GraphQLString)}
      },
      resolve(parent, args) {

        return clientModel.findByIdAndRemove(args.id);
      },
    },
      // Add a project
      addProject: {
        type: ProjectType,
        args: {
          name: { type: GraphQLNonNull(GraphQLString) },
          description: { type: GraphQLNonNull(GraphQLString) },
          status: {
            type: new GraphQLEnumType({
              name: 'ProjectStatus',
              values: {
                new: { value: 'Not Started' },
                progress: { value: 'In Progress' },
                completed: { value: 'Completed' },
              },
            }),
            defaultValue: 'Not Started',
          },
          clientId: { type: GraphQLNonNull(GraphQLID) },
        },
        resolve(parent, args) {
          const project = new projectModel({
            name: args.name,
            description: args.description,
            status: args.status,
            clientId: args.clientId,
          });
  
          return project.save();
        },
      },
      //delete a project
    deleteProject:{
      type:ProjectType,
      args:{
        id:{type:GraphQLNonNull(GraphQLString)}
      },
      resolve(parent, args) {

        return projectModel.findByIdAndRemove(args.id);
      },
    },
    updateProject: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: {
          type: new GraphQLEnumType({
            name: 'ProjectStatusUpdate',
            values: {
              new: { value: 'Not Started' },
              progress: { value: 'In Progress' },
              completed: { value: 'Completed' },
            },
          }),
        },
      },
      resolve(parent, args) {
        return projectModel.findByIdAndUpdate(
          args.id,
          {
            $set: {
              name: args.name,
              description: args.description,
              status: args.status,
            },
          },
          { new: true }
        );
      },
    },
  }
})

const schema= new GraphQLSchema({
  query:rootQuery,
  mutation:myMutation 
})

export default schema;
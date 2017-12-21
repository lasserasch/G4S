using G4S.Foundation.Dictionary.Services;

using Unity.RegistrationByConvention;
using System;

using Unity;
using System.IO;
using System.Reflection;
using System.Collections;
using System.Collections.Generic;

namespace Website
{
    /// <summary>
    /// Specifies the Unity configuration for the main container.
    /// </summary>
    public static class UnityConfig
    {
        #region Unity Container
        private static Lazy<IUnityContainer> container =
          new Lazy<IUnityContainer>(() =>
          {
              var container = new UnityContainer();
              RegisterTypes(container);
              return container;
          });

        /// <summary>
        /// Configured Unity Container.
        /// </summary>
        public static IUnityContainer Container => container.Value;
        #endregion

        /// <summary>
        /// Registers the type mappings with the Unity container.
        /// </summary>
        /// <param name="container">The unity container to configure.</param>
        /// <remarks>
        /// There is no need to register concrete types such as controllers or
        /// API controllers (unless you want to change the defaults), as Unity
        /// allows resolving a concrete type even if it was not previously
        /// registered.
        /// </remarks>
        public static void RegisterTypes(IUnityContainer container)
        {
            container.RegisterTypes(
            AllClasses.FromAssemblies(GetAllG4SAssemblies()),
            WithMappings.FromMatchingInterface,
            WithName.Default,
            WithLifetime.ContainerControlled);

            // 21.12.2017 - Lasse Rasch Note
            // Add Custom Overrides here if nessesary or call a bootstrapper to do it.
        }

        public static List<Assembly> GetAllG4SAssemblies()
        {
            string binPath = System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "bin");
            List<Assembly> assemblies = new List<Assembly>();

            foreach (string dll in Directory.GetFiles(binPath, "G4S.*.dll", SearchOption.AllDirectories))
            {
                try
                {
                    assemblies.Add(Assembly.Load(System.IO.File.ReadAllBytes(dll)));
                }
                catch (FileLoadException loadEx)
                { } // The Assembly has already been loaded.
                catch (BadImageFormatException imgEx)
                { } // If a BadImageFormatException exception is thrown, the file is not an assembly.
            }
            return assemblies;
        }
    }
}